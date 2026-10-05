---
title: "Memory Used - procfs - system"
description: "Documentation for MemoryUsedProcfsSystemProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 182
---

### What it does

This metric provider reads the amount of memory, in bytes, that is in use on the whole system. It reads the data from the `/proc/meminfo` file. More information about this file can be found in the [Linux kernel documentation](https://www.kernel.org/doc/html/latest/filesystems/proc.html).

Unlike the [cgroup memory providers]({{< relref "memory-used-cgroup-container" >}}), which only look at a single container or cgroup, this provider covers all processes of the machine. In the `config.yml.example` it is listed in the *Debug* group.

### Classname

- `MemoryUsedProcfsSystemProvider`

### Metric Name

- `memory_used_procfs_system`

### Unit

- `Bytes`

### Platform

Linux only. The provider is configured in the `linux` section of the `config.yml`.

### Prerequisites & Installation

The provider needs read access to `/proc/meminfo`, which is available on every regular Linux system. The binary is built by the install script and does not need root permissions.

The provider is configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    linux:
      memory_used_procfs_system:
        sampling_rate: 99
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
  - `-i`: interval in milliseconds
  - `-c`: check mode. Checks that `/proc/meminfo` can be opened and exits.
  - `-h`: prints the usage

By default the measurement interval of the binary is 1000 ms. GMT always passes the configured `sampling_rate`.

```bash
./metric-provider-binary -i 99
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The memory in use on the system, in bytes

Any errors are printed to Stderr.

The `detail_name` of the metric is always `[SYSTEM]`.

### How it works

In every interval the provider reads `/proc/meminfo` and adds up these fields:

- `Active` (active anonymous and active file backed memory)
- `SUnreclaim` (unreclaimable slab memory)
- `Percpu`
- `Unevictable`

Inactive memory is not counted, as the kernel can free it if needed. The selection mirrors what the [cgroup memory providers]({{< relref "memory-used-cgroup-container" >}}) count for a single cgroup, applied to the whole system.

`/proc/meminfo` reports values in kibibytes. The provider multiplies the sum by 1024 to output bytes. If one of the four fields cannot be found, the binary prints an error such as *"Could not match active"* and exits.

In the phase statistics GMT stores the mean, maximum and minimum memory usage for every phase.
