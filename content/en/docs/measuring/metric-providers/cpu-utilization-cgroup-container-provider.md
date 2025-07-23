---
title: "CPU % - cgroup - container"
description: "Documentation for CpuUtilizationCgroupContainerProvider of the Green Metrics Tool"
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 140
---
### What it does

This metric provider calculates an estimate of the % total CPU usage based on the cgroups stats file of your docker containers. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname

- `CpuUtilizationCgroupContainerProvider`

### Metric Name

- `cpu_utilization_cgroup_container`

### Input Parameters

- args
    - `-s`: container-ids seperated by commas
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
```


### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CONTAINER-ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The estimated % CPU used
- `CONTAINER-ID`: The container ID that this reading is for

Any errors are printed to Stderr.

### How it works

The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system

The provider reads from two files. To get the number of microseconds spent in the CPU by the container, during the interval, it reads from:

```
/sys/fs/cgroup/user.slice/user-<USER-ID>.slice/user@<USER-ID>.service/user.slice/docker-<CONTAINER-ID>.scope/cpu.stat
```

To get the total time spent by the cpu during that time interval, in Jiffies, you read from `/proc/stat`. We collect **user**, **nice**, **system**, **idle** **iowait**, **irq**, **softirq**, **steal** (see definitions [here](https://www.idnt.net/en-US/kb/941772)), add them together, divide by _SC_CLK_TCK_ (typically 100 Hz). The percentage of the cgroup time divided by this sum is the total percentage of CPU time spent by the container.

Then it calculates the % cpu used via this formula: `container_reading * 10000 / main_cpu_reading`

In order to work in rootless cgroup delegation must be enabled here:
`/etc/systemd/system/user@.service.d/delegate.conf`

Currently, `<USER-ID>` is set to the calling user.

