---
title: "CPU % - mach - system"
description: "Documentation for CpuUtilizationMachSystemProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 143
---

### What it does

This metric provider calculates the total CPU utilization of the system on **macOS**. It is the macOS counterpart of the Linux [CPU % procfs system provider]({{< relref "cpu-utilization-procfs-system" >}}) and reads the CPU load counters of the Mach kernel.

In the phase statistics GMT treats it as the CPU utilization of the machine, just like the value of the procfs provider. It also serves as the input for the model based energy providers [SDIA]({{< relref "psu-energy-sdia-machine" >}}) and [XGBoost]({{< relref "psu-energy-xgboost-machine" >}}). Both read the output of this provider if the procfs provider is not available.

### Classname

- `CpuUtilizationMachSystemProvider`

### Metric Name

- `cpu_utilization_mach_system`

### Unit

- `Ratio`

The value is the utilization ratio multiplied by 10000. A value of `10000` means 100 % utilization of all cores, `2500` means 25 %.

### Platform

macOS only. The provider is configured in the `macos` section of the `config.yml`.

### Prerequisites & Installation

The provider needs no special permissions. The install script `install_mac.sh` builds the binary for you. On macOS it only builds the providers that live in a `mach` folder.

The provider is configured in the `config.yml`. It is already enabled in the `macos` section of the `config.yml.example`:

```yml
measurement:
  metric_providers:
    macos:
      cpu_utilization_mach_system:
        sampling_rate: 99
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info. For the full macOS setup see [Installation on macOS →]({{< relref "/docs/installation/installation-macos" >}}).

### Input Parameters

- args
  - `-i`: interval in milliseconds
  - `-c`: check mode. Queries the CPU load information once and exits.
  - `-h`: prints the usage

By default the measurement interval of the binary is 1000 ms. GMT always passes the configured `sampling_rate`. If you set an interval below 50 ms, the binary prints a warning to Stderr, as the kernel does not update the counters that fast and the results will contain zeros.

```bash
./metric-provider-binary -i 99
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The CPU utilization of the whole system as a ratio multiplied by 10000

Any errors are printed to Stderr.

The `detail_name` of the metric is always `[SYSTEM]`.

### How it works

In every interval the provider calls `host_processor_info()` with `PROCESSOR_CPU_LOAD_INFO`. This returns the ticks that every CPU has spent in the `user`, `system`, `nice` and `idle` states.

For every CPU it computes the difference to the previous call and calculates:

`(user + system + nice) / (user + system + nice + idle)`

The ratios of all CPUs are averaged and multiplied by 10000 to get an integer value. The very first sample has no previous call to compare to. It therefore uses the absolute counters since boot.

In the phase statistics GMT stores the mean, maximum and minimum utilization for every phase.

### Caveats

- The provider measures the utilization of the host. On macOS Docker runs inside a VM, so the utilization includes everything the VM and all other processes on the Mac do.
- Running GMT on macOS is meant for testing your usage scenarios, not for benchmarking. Please see [Installation on macOS →]({{< relref "/docs/installation/installation-macos" >}}).
