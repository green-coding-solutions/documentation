---
title: "CPU Throttling - MSR - Component"
description: "Documentation for CpuThrottlingMsrComponentProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 121
---

### What it does

This metric provider reports whether the CPU is currently throttled. It distinguishes two reasons for throttling:

- **Thermal throttling**: The CPU slows down because it is too hot.
- **Power limit throttling**: The CPU runs below the requested performance because a power limit is active.

Throttling changes how fast the CPU works, so GMT treats measurements taken during throttling as possibly inaccurate (see [Throttling warning](#throttling-warning)). This provider is meant for debugging and introspection. In the `config.yml.example` it is listed in the *Debug* group.

The provider reads the `IA32_THERM_STATUS` machine specific register (MSR) via the Linux MSR interface.

### Classname

- `CpuThrottlingMsrComponentProvider`

### Metric Name

The provider produces two metrics:

- `cpu_throttling_thermal_msr_component`
- `cpu_throttling_power_msr_component`

### Unit

- `boolean`

A value of `1` means throttling was active at the time of the sample. A value of `0` means it was not.

### Platform

Linux only. The provider is configured in the `linux` section of the `config.yml`.

### Prerequisites & Installation

The provider needs read access to `/dev/cpu/<n>/msr`. These files are provided by the `msr` kernel module. The `Makefile` installs the binary with the setuid root bit, so that GMT can read the MSRs without running as root. The install script builds the binary for you.

The provider is configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    linux:
      cpu_throttling_msr_component:
        sampling_rate: 99
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
  - `-i`: interval in milliseconds
  - `-c`: check mode. Reads the register once on CPU 0 and exits.
  - `-h`: prints the usage

By default the measurement interval of the binary is 1000 ms. GMT always passes the configured `sampling_rate`.

```bash
./metric-provider-binary -i 99
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP THERMAL POWER_LIMIT PACKAGE`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `THERMAL`: `1` if thermal throttling is active, otherwise `0`
- `POWER_LIMIT`: `1` if power limit throttling is active, otherwise `0`
- `PACKAGE`: The CPU package in the form `Package_<n>`. This becomes the `detail_name` of both metrics.

Example output:

```txt
1712641603443421 0 0 Package_0
1712641603543702 1 0 Package_0
```

Any errors are printed to Stderr.

GMT splits every line into the two metrics `cpu_throttling_thermal_msr_component` and `cpu_throttling_power_msr_component`.

### How it works

On startup the binary looks at `/sys/devices/system/cpu/cpu<n>/topology/physical_package_id` for every CPU and remembers the first logical CPU of each physical package. It supports up to 16 packages.

In every interval it reads the `IA32_THERM_STATUS` register (`0x19C`) on that CPU of each package via `/dev/cpu/<n>/msr`. It then evaluates two bits:

- Bit 0 is the thermal status. If it is set, the provider reports thermal throttling.
- Bit 10 is the power limitation status. If it is set, the provider reports power limit throttling.

In the phase statistics GMT stores the mean, maximum and minimum value of both metrics for every phase.

### Throttling warning

When this provider is enabled and throttling occurred, GMT adds a warning to the run. This was introduced with [PR #1838](https://github.com/green-coding-solutions/green-metrics-tool/pull/1838).

For every phase GMT checks the maximum value of both metrics. If any sample in a phase was `1`, it adds a warning of this form:

```txt
<Thermal|Power limit> throttling detected on <detail_name> during phase '<phase name>'. Measurements might be inaccurate.
```

For example:

```txt
Thermal throttling detected on Package_0 during phase '[BASELINE]'. Measurements might be inaccurate.
```

The warning is shown together with the other warnings of the run in the frontend.

### Caveats

- The provider samples the status bits at every interval. A short throttling event that starts and ends between two samples will not show up.
- The provider reads the register only on the first logical CPU of each package and reports the result for the whole package. The other cores of the package are not read.
- If MSR access is not available, for example in many VMs, the check of the binary fails and GMT does not start the provider.

### Troubleshooting

- **`rdmsr:open: Permission denied`**: The setuid bit is not set on the binary. Re-run `make` in the provider directory (requires sudo).
- **`rdmsr:open: No such file or directory`**: The `msr` kernel module is not loaded. Run `sudo modprobe msr`.
- **`rdmsr: CPU 0 doesn't support MSRs`**: The CPU or the virtualization layer does not expose MSRs.
- **`Error reading MSR 19c`**: The register could not be read. The CPU might not implement `IA32_THERM_STATUS`.
