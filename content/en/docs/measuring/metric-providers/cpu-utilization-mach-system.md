---
title: "CPU % - mach - system"
description: "Documentation of CpuUtilizationMachSystemProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 143
---

### What it does

This metric provider measures the total CPU utilization of the system on **macOS** by reading the
per-CPU load counters from the Mach kernel via `host_processor_info()`.

It is the macOS equivalent of the
[CPU % procfs system provider]({{< relref "cpu-utilization-procfs-system" >}}).

### Classname

- `CpuUtilizationMachSystemProvider`

### Metric Name

- `cpu_utilization_mach_system`

### Unit

- `Ratio`

Since we want the output as a ratio that can be expressed as an integer, the percentage is
multiplied by 100. A reading of `4250` therefore means 42.50 % CPU utilization.

### Configuration

The provider lives in the `macos` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    macos:
      cpu_utilization_mach_system:
        sampling_rate: 99
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to the binary as `-i`.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
    - `-i`: interval in milliseconds
    - `-c`: check/test mode — queries the CPU info once and exits
    - `-h`: prints usage and exits

By default the measurement interval is 1000 ms.

```bash
./metric-provider-binary -i 100
```

Values below 50 ms are accepted but print a warning to Stderr, because the kernel does not update
the counters that fast and the results will contain zeroes.

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The CPU utilization across all CPUs, in percent multiplied by 100

Any errors are printed to Stderr.

### How it works

The provider is a compiled C binary that calls
`host_processor_info(mach_host_self(), PROCESSOR_CPU_LOAD_INFO, ...)` once per interval. This
returns per-CPU tick counters for the `USER`, `SYSTEM`, `NICE` and `IDLE` states.

For every CPU the binary computes the deltas against the previous sample and derives:

```C
in_use = d(USER) + d(SYSTEM) + d(NICE)
total  = in_use + d(IDLE)
util   = in_use / total
```

The per-CPU ratios are summed, divided by the number of CPUs, and multiplied by 100 * 100 to give
an integer percentage with two decimals of resolution.

The previous sample buffer is released with `vm_deallocate()` on every iteration, so the binary
does not leak the Mach-allocated arrays.

### Caveats

- The **first** reading has no previous sample to compare against. It therefore uses the absolute
  counters, which have been accumulating since boot, and reports the average utilization since
  boot rather than the utilization of the interval. Only the second and later readings represent
  the configured interval.
- The value is a system-wide average across all CPUs. It includes everything running on the
  machine, not just the measured workload.
- `NICE` time is counted as in-use, `IDLE` is counted as idle.
- This provider only works on **macOS**. It relies on the Mach host interface.
- On Apple Silicon the efficiency and performance cores are averaged together without weighting,
  so the value does not reflect the asymmetric capacity of the cores.

### Troubleshooting

- **`There was an error getting CPU info: <message>`** — the `host_processor_info()` call failed.
  The message is the Mach error string.
- **`The call was successful but the data is wrong.`** — the kernel reported zero CPUs. This is
  returned by the `-c` check mode when the data cannot be trusted.
- **`A value of <n> is to small. Results will include 0s as the kernel does not update as fast.`** —
  the configured `sampling_rate` is below 50 ms. Raise it.
