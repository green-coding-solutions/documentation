---
title: "Disk IO - cgroup - system"
description: "Documentation for DiskIoCgroupSystemProvider of the Green Metrics Tool"
date: 2025-01-15T08:49:15+00:00
weight: 206
---

### What it does

This metric provider reads the total amount of read and written bytes from disk devices by the cgroups of your system cgroup processes. More information about cgroups can be found in the [cgroups man page](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

It can be used for system monitoring and tracking background processes such as the desktop environment. It is also used to calculate GMT's overhead.

### Classname

- `DiskIoCgroupSystemProvider`

### Metric Name

- `disk_io_cgroup_system`

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

`TIMESTAMP RBYTES WBYTES CGROUP-NAME`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `RBYTES`: The cumulative amount of bytes read from disk since cgroup start
- `WBYTES`: The cumulative amount of bytes written to disk since cgroup start
- `CGROUP-NAME`: The cgroup name that this reading is for

Any errors are printed to Stderr.

### How it works

This metric provider uses the exact same code as the metric provider ["Disk IO - cgroup - container" →]({{< relref "disk-io-cgroup-container#how-it-works" >}}).
