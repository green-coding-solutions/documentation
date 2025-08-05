---
title: "CPU Time - cgroup - system"
description: "Documentation of CpuTimeCgroupSystemProvider for the Green Metrics Tool"
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 131
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
This metric provider is only for debug purposes and prone to change!
{{< /callout >}}

### What it does

This metric provider reads time spent in the CPU based on the cgroups stats file for all your cgroups. More information about cgroups can be found in the [Linux manual pages](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname

- `CpuTimeCgroupSystemProvider`

### Metric Name

- `cpu_time_cgroup_system`

### Input Parameters

{{< callout context="note" icon="outline/info-circle" >}}
Unlike the other cgroup system metric providers, this metric provider does not currently accept the ‘-s’ argument for cgroup filtering. Instead, it can only read system-wide stats.
{{< /callout >}}

- args
  - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100 
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`:The time spent in the CPU, in microseconds, by all cgroup containers

Any errors are printed to Stderr.

### How it works

The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system

The provider reads from the `/sys/fs/cgroup/cpu.stat` file.

In order to work in rootless cgroup delegation must be enabled here:
`/etc/systemd/system/user@.service.d/delegate.conf`

Currently, `<USER-ID>` is set to the calling user.
