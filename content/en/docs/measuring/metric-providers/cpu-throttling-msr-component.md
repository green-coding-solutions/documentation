---
title: "CPU Throttling - MSR - component"
description: "Documentation of CpuThrottlingMsrComponentProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 121
---

### What it does

This metric provider reports whether each CPU package is currently being throttled, by reading the
`IA32_THERM_STATUS` register on **Intel CPUs** via the Linux MSR (Model Specific Register)
interface. It distinguishes two independent causes: thermal throttling and power limit throttling.

It is a debugging and introspection provider. It tells you *why* a measurement may be slower or
less reproducible than expected — it does not measure energy.

### Classname

- `CpuThrottlingMsrComponentProvider`

### Metric Name

The provider registers itself as `cpu_throttling_msr_component`, but it splits its readings into
two sub-metrics, and these are what actually land in the database:

- `cpu_throttling_thermal_msr_component`
- `cpu_throttling_power_msr_component`

### Unit

- `boolean`

The value is `1` while the corresponding throttling condition is signalled and `0` otherwise.

### Configuration

The provider lives in the `linux` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    linux:
      cpu_throttling_msr_component:
        sampling_rate: 99
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to the binary as `-i`.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
    - `-i`: interval in milliseconds
    - `-c`: check/test mode — opens the MSR of CPU 0, reads `IA32_THERM_STATUS` and exits
    - `-h`: prints usage and exits

By default the measurement interval is 1000 ms.

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP THERMAL_THROTTLING_STATUS POWER_LIMIT_THROTTLING_STATUS PACKAGE`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `THERMAL_THROTTLING_STATUS`: `1` if the thermal throttling bit is set, `0` otherwise
- `POWER_LIMIT_THROTTLING_STATUS`: `1` if the power limit bit is set, `0` otherwise
- `PACKAGE`: The package identifier, formatted as `Package_<n>`

The package identifier becomes the `detail_name` of both sub-metrics.

Any errors are printed to Stderr.

### How it works

The provider is a compiled C binary that reads the `IA32_THERM_STATUS` register (MSR `0x19C`) once
per package per interval and extracts two bits:

- Bit 0 (`THERMAL_THROTTLING_STATUS_BIT`) — thermal throttling
- Bit 10 (`POWER_LIMIT_STATUS_BIT`) — power limit throttling

Package discovery happens at startup by enumerating
`/sys/devices/system/cpu/cpuX/topology/physical_package_id` and recording the first CPU seen for
each distinct package id. Offline CPUs and non-contiguous numbering are skipped. Up to 1024 CPUs
and 16 packages are supported; a higher package id aborts the binary. If no packages are detected
at all the binary exits with code 1.

The MSR of the first CPU of each package is then opened via `/dev/cpu/<n>/msr` and read in a loop.

Because the binary needs to open `/dev/cpu/*/msr` (which is restricted to root), the compiled
binary is installed with the setuid-root bit set.

The two bits are read from a single register read, so a row always carries a consistent pair.
On the Python side the dataframe is split into the two sub-metrics listed above, each keeping the
package as its `detail_name`.

### Caveats

- The register is sampled at the configured interval, so throttling that starts and stops entirely
  between two samples is not recorded. A `0` therefore means "not throttling at the sampling
  instant", not "never throttled".
- Only the first CPU of each package is read. The value is a package-level signal, not per-core.
- This provider only works on **Intel CPUs**. `IA32_THERM_STATUS` is Intel-specific.
- It cannot be used on most VMs or in containers where MSR access is blocked.
- The unit is `boolean`, so the usual aggregations (sum, average) over these values are not
  energy-meaningful. Read the series as a timeline, not as a total.

### Troubleshooting

The provider requires read access to `/dev/cpu/*/msr`. Common failure modes:

- **`rdmsr: No CPU <n>`** — the MSR device for that CPU does not exist.
- **`rdmsr: CPU <n> doesn't support MSRs`** — the `msr` kernel module is not loaded. Run
  `sudo modprobe msr`.
- **`rdmsr:open: Permission denied`** — the setuid bit is not set on the binary. Re-run `make` from
  the provider directory (requires sudo).
- **`No CPU packages detected`** — `/sys/devices/system/cpu/cpu*/topology/physical_package_id`
  could not be read. This usually indicates a VM or a restricted container.
- **`Package ID <n> exceeds maximum supported packages (16)`** — the machine reports more packages
  than the binary supports.
