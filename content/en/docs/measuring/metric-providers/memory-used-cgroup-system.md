---
title: "Memory Used - cgroup - system"
description: "Documentation for MemoryUsedCgroupSystemProvider of the Green Metrics Tool"
date: 2025-01-15T08:49:15+00:00
draft: false
images: []
weight: 181
---

### What it does

This metric provider reads the amount of memory, in bytes, used by the cgroup of your system cgroup processes. More information about cgroups can be found in the [Linux manual pages](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

It can be used for system monitoring and tracking background processes such as the desktop environment. It is also used to calculate GMT's overhead.

### Classname

- `MemoryUsedCgroupSystemProvider`

### Metric Name

- `memory_used_cgroup_system`

### Input Parameters

- args
  - `-s`: cgroup name strings separated by commas
  - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100 -s org.gnome.Shell@wayland.service,session-2.scope
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CGROUP-NAME`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The amount of memory, in bytes, used during the time interval
- `CGROUP-NAME`: The cgroup name that this reading is for

Any errors are printed to Stderr.

### How it works

This metric provider uses the exact same code as the metric provider ["Memory Used - cgroup - container" →]({{< relref "memory-used-cgroup-container#how-it-works" >}}).
