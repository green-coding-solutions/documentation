---
title: "Powermetrics"
description: "Documentation of PowermetricsProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 230
---

### What it does

This metric provider wraps Apple's `/usr/bin/powermetrics` tool on **macOS** and extracts energy,
CPU time and disk I/O data from it.

On macOS this is the primary provider. Because `powermetrics` reports the energy of the CPU, GPU
and Neural Engine as well as the resource usage of the Docker VM, a single provider covers what
takes several providers on Linux. The `config.yml.example` accordingly notes: *On Mac you only need
this provider. Please remove all others!*

### Classname

- `PowermetricsProvider`

### Metric Name

- `powermetrics`

This is the name the provider registers under, but it is **not** what appears in the database. The
provider inlines several metrics and sets their names individually while parsing. See
[Output](#output) for the actual metric names.

### Unit

- `uJ`

This is the provider's default unit. The inlined metrics each carry their own unit — see
[Output](#output).

### Configuration

The provider lives in the `macos` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    macos:
      powermetrics:
        sampling_rate: 499 # If you set this value too low powermetrics will not be able to accommodate the timing. We recommend no lower than 199 ms
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to `powermetrics` as `-i`. The recommended
  value is `499`, and we recommend **no lower than 199 ms**: below that `powermetrics` cannot keep
  up with the requested timing.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

The provider calls the system binary `/usr/bin/powermetrics` with `sudo` and appends a fixed set of
switches:

```bash
sudo /usr/bin/powermetrics -i 499 --show-process-io --show-process-gpu --show-process-netstats --show-process-energy --show-process-coalition -f plist -b 0
```

Where:

- `-i`: interval in milliseconds, taken from `sampling_rate`
- `--show-process-*`: enable the individual sample groups the parser needs
- `-f plist`: emit plist rather than human-readable text
- `-b 0`: no buffering

The individual `--show-process-*` switches are used instead of `--show-all`, because `--show-all`
sometimes triggers output on Stderr, which the tool treats as a provider failure.

### Output

`powermetrics` writes a stream of binary plist documents, separated by null bytes (`\x00`), which
the provider parses at the end of the run. Rather than one time series, it produces several metrics
at once:

| Metric | detail_name | Unit | Source |
|---|---|---|---|
| `cpu_energy_powermetrics_component` | `[COMPONENT]` | `uJ` | `processor.package_joules` |
| `cores_energy_powermetrics_component` | `[COMPONENT]` | `uJ` | `processor.cpu_power` |
| `gpu_energy_powermetrics_component` | `[COMPONENT]` | `uJ` | `processor.gpu_power` |
| `ane_energy_powermetrics_component` | `[COMPONENT]` | `uJ` | `processor.ane_power` (Apple Neural Engine) |
| `cpu_time_powermetrics_vm` | `docker_vm` | `ns` | Docker coalition `cputime_ns` |
| `disk_io_bytesread_powermetrics_vm` | `docker_vm` | `Bytes` | Docker coalition `diskio_bytesread` |
| `disk_io_byteswritten_powermetrics_vm` | `docker_vm` | `Bytes` | Docker coalition `diskio_byteswritten` |
| `energy_impact_powermetrics_vm` | `docker_vm` | `*` | Docker coalition `energy_impact` |

Each field is only emitted if it is present in the sample, so which metrics you get depends on the
hardware and on whether Docker was running.

The `energy_impact` metric uses the unit `*`. This is deliberate: energy impact is an
Apple-internal scoring value whose definition is
[not publicly documented](https://tinyurl.com/2p9c56pz), so we cannot map it to a physical unit.

### How it works

Timestamps are reconstructed rather than read per sample. The provider takes the `timestamp` of the
first document as the anchor and then accumulates each document's `elapsed_ns`, so the time series
follows the intervals `powermetrics` actually achieved rather than the ones that were requested.

The energy conversion exploits the units `powermetrics` already uses. `cpu_power`, `gpu_power` and
`ane_power` are reported in mW, so multiplying by the elapsed time in milliseconds
(`elapsed_ns / 1_000_000`) yields microjoules directly. `package_joules` is already an energy value
and is simply multiplied by 1,000,000.

The Docker VM data comes from the `coalitions` list, where the provider looks for the entry named
`com.docker.docker`. If Docker is not running the VM metrics are simply absent.

### Health check

Before the run the provider counts running `powermetrics` processes with `pgrep -ix powermetrics`.
If any instance is already running it refuses to start, because a second instance would interfere
with the measurement. You can override this with `--dev-no-system-checks`.

The count taken at startup is remembered and used again on shutdown to detect whether *our*
instance has actually terminated.

### Shutdown

Stopping `powermetrics` is more involved than for other providers. Because it runs under `sudo`,
the tool cannot signal it directly. The provider therefore:

1. Sends `SIGIO` to ask the process to flush. This is common practice; the process does not appear
   to react to it, but it is kept as it does no harm.
2. Tries the normal termination path, which fails with a `PermissionError` due to the missing root
   permissions.
3. Falls back to `sudo /usr/bin/killall powermetrics`.
4. Waits (up to 60 seconds) until the process is really gone, so that it has time to flush its
   output to disk.

If the process is still alive after 60 seconds it is killed with `kill -9` and a `RuntimeError` is
raised, because a `powermetrics` that did not flush cleanly may have produced truncated data:
*"Values can not be trusted!"*

### Caveats

- **`killall` kills every `powermetrics` process on the system**, not just ours. If you had other
  instances running — for example the [hog](https://github.com/green-coding-solutions/hog) — they
  will be terminated too. The hog restarts itself, but manually started instances will not; the
  provider prints a notice when this happens. Keeping only our PID and killing that is not possible
  without root, and a `sudoers` entry with a PID wildcard would open a security hole.
- A `sampling_rate` below 199 ms is not honoured reliably: `powermetrics` cannot accommodate the
  timing and the effective intervals will drift away from what you configured.
- The resolution underflow check is disabled for this provider, because `powermetrics` data is
  frequently sparse and legitimately reports 0 for idle components.
- Some Stderr output from `powermetrics` is filtered out and ignored, specifically lines containing
  `proc_pid` and `Second underflow occured`. These appear sporadically, are not correlated with the
  interval, and are not documented by Apple; since the tool aborts a run on unexpected Stderr, they
  are suppressed rather than treated as failures.
- If a container stops very quickly the log file can be empty, because `powermetrics` takes some
  time to start up. In that case no data is recorded for the run.
- The energy values are component-level values for the whole machine. They are not attributed to
  individual containers.

### Troubleshooting

- **`Another instance of powermetrics is already running on the system!`** — close it before
  running the Green Metrics Tool, or override with `--dev-no-system-checks`.
- **`powermetrics had to be killed with kill -9. Values can not be trusted!`** — the process did not
  terminate within 60 seconds. The run's data should be discarded.
- **`There was an error parsing the powermetrics data!`** — a plist chunk could not be decoded. The
  iteration count and the offending chunk are printed to help locate the problem.
- Empty measurements — check that the run was long enough for `powermetrics` to produce at least
  one sample.
