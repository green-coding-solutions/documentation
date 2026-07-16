---
title: "CPU Energy - RAPL - Scaphandre - component"
description: "Documentation of CpuEnergyRaplScaphandreComponentProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 111
---

### What it does

This metric provider reads the Intel/AMD RAPL energy counters on **Windows** through the
[ScaphandreDrv](https://github.com/hubblo-org/scaphandre) kernel driver. It is the Windows
counterpart to the Linux [CPU Energy RAPL MSR provider]({{< relref "cpu-energy-RAPL-MSR-component" >}}).

### Classname

- `CpuEnergyRaplScaphandreComponentProvider`

### Metric Name

- `cpu_energy_rapl_msr_component`

Please note that the metric name is **not** `cpu_energy_rapl_scaphandre_component`. The provider
deliberately registers itself under the same metric name as the Linux MSR provider so that runs
made on Windows and on Linux carry the same metric and can be compared directly.

The name you use in the `config.yml` (`cpu_energy_rapl_scaphandre_component`) is therefore
different from the metric name that ends up in the database (`cpu_energy_rapl_msr_component`).

### Unit

- `uJ`

### Configuration

The provider lives in the `windows` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    windows:
      cpu_energy_rapl_scaphandre_component:
        sampling_rate: 99
        # Optionally disable individual RAPL domains
        # domains:
        #   cpu_gpu: False
        #   dram: False
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to the binary as `-i`.
- `domains` — optional map of RAPL domains to booleans. Valid keys are `cpu_package`, `cpu_cores`,
  `cpu_gpu`, `dram` and `psys`. Any domain set to a falsy value is passed to the binary via `-x`
  and is never read. Setting a domain to `True` has no effect beyond not disabling it, since all
  supported domains are measured by default. An unknown domain name raises a
  `MetricProviderConfigurationError` at startup.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
    - `-i`: interval in milliseconds (the binary's own default is 99)
    - `-d`: measure a single named domain only and skip auto-detection
    - `-x`: comma-separated list of domains to disable, e.g. `-x cpu_gpu,dram`
    - `-c`: check mode — reads the RAPL power unit MSR and exits

The provider itself only ever passes `-i` and (when `domains` disables something) `-x`.

```bash
metric-provider-binary.exe -i 99 -x cpu_gpu,dram
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING DETAIL_NAME`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The energy consumed by the domain since the previous sample in *uJ*
- `DETAIL_NAME`: The RAPL domain — one of `cpu_package`, `cpu_cores`, `cpu_gpu`, `dram`, `psys`

Any errors are printed to Stderr.

Unlike the other providers, the Python side does not redirect Stdout through a shell. It opens the
log file itself and hands the file handle to the subprocess.

### How it works

The provider is a C binary (`metric-provider-binary.exe`) that opens the driver device
`\\.\ScaphandreDriver` and issues `IOCTL_READ_MSR` calls to read the RAPL MSRs directly. It reads
CPU index 0 only.

The energy unit is derived from `MSR_RAPL_POWER_UNIT` (`0x606`), with a fallback to the AMD
register `0xC0010299`. Each domain is then read from its own energy status register and the
delta to the previous sample is converted to microjoules. A negative delta is treated as a 32-bit
counter wrap and corrected by adding the counter range.

At startup the binary auto-detects which domains are actually active by taking one sample 100 ms
apart per domain: `dram`, `cpu_gpu` and `psys` are dropped if they report no energy progression.
Auto-detection is skipped entirely when a single domain was forced with `-d`, and domains excluded
via `-x` are removed before detection so they are never probed.

Timing uses `QueryPerformanceCounter` plus a wall-clock offset taken at startup, mirroring the
`get_time_offset()` / `get_adjusted_time()` approach of the Linux providers. The binary calls
`timeBeginPeriod(1)` to raise the Windows timer resolution to 1 ms, because the default 15.6 ms
timer granularity would make `Sleep(99)` overshoot far outside the tool's sampling rate tolerance.
The main loop is deadline-based: it records the tick at the start of each iteration and sleeps only
the *remaining* time, so measurement overhead does not accumulate into drift.

The `cpu_package` domain doubles as a health canary. If its read fails, the driver is considered
faulty. After 5 consecutive failures the binary exits with code 2 so that the tool notices the
process died rather than silently recording nothing. If you disable `cpu_package` via `domains`,
it is still read internally as the canary but is not printed.

### Installation

The binary is compiled with MSVC. From the *x64 Native Tools Command Prompt for VS*, run
`build.bat` in the provider folder, which invokes:

```bash
cl rapl_reader_cli.c /Fe:metric-provider-binary /O2 /W3 /link winmm.lib
```

`winmm.lib` is required for `timeBeginPeriod` / `timeEndPeriod`.

The ScaphandreDrv kernel driver must be installed and running before the provider can be used.

### Caveats

- The metric name in the database is `cpu_energy_rapl_msr_component`, not the config key. See
  [Metric Name](#metric-name) above.
- Only CPU index 0 is read. On multi-socket machines the other packages are not measured.
- The `cpu_gpu` domain reports a minimum of 2 uJ when the real delta is 0. This is done to avoid a
  resolution underflow error while keeping the time series gap-free, so a constant 2 uJ on
  `cpu_gpu` should be read as "no measurable GPU energy", not as an actual measurement.
- Domains that are inactive at startup are dropped for the whole run. A domain that only becomes
  active later will not appear.
- RAPL is an on-chip model, not a physical power meter at the wall. See the
  [RAPL documentation]({{< relref "cpu-energy-RAPL-MSR-component" >}}) for the general caveats
  that apply to all RAPL-based providers.

### Troubleshooting

- **`Cannot open driver. Error: <n>`** — the ScaphandreDrv driver is not installed or not running.
  Check with `sc.exe query ScaphandreDrv` and start it with `sc.exe start ScaphandreDrv`.
- **`Cannot read RAPL power unit MSR.`** — the driver responds but the CPU does not expose the RAPL
  power unit register. This typically means RAPL is unavailable, for instance in a VM.
- **`Fatal: ScaphandreDrv driver lost after 5 consecutive failures.`** — the driver stopped
  responding during the measurement. Verify it is still running with `sc.exe query ScaphandreDrv`.
- **`Unknown RAPL domain '<name>'`** — a `domains` key in the `config.yml` is misspelled. Valid
  values are `cpu_package`, `cpu_cores`, `cpu_gpu`, `dram` and `psys`.
- If the system check fails, make sure that `metric-provider-binary.exe` exists in the provider
  folder and that the driver is installed and running.
