---
title: "CPU Time - cgroup"
description: "Documentation of CpuTimeCgroupProvider for the Green Metrics Tool"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 112
---
### What it does

This metric provider reads time spent in the CPU based on the cgroups stats file for all your cgroups. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname
- CpuTimeCgroupProvider

### Input Parameters

- args
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
> sudo ./static-binary -i 100 
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CONTAINER-ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`:The time spent, in microseconds, by this container in the CPU

Any errors are printed to Stderr.

### How it works
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system

The provider reads from the `/sys/fs/cgroup/cpu.stat` file.

In order to work in rootless cgroup delegation must be enabled here:
`/etc/systemd/system/user@.service.d/delegate.conf`

Currently, `<USER-ID>` is set to the calling user.