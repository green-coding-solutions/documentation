---
title: "Memory Total - cgroup - container"
description: "Documentation for MemoryTotalCgroupContainerProvider of the Green Metrics Tool"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 121
---

### What it does
It reads the total amount of memory, in bytes, used by the cgroup of a container. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname
- MemoryTotalCgroupContainerProvider

### Input Parameters

- args
    - `-s`: container-ids seperated by commas
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```
> sudo ./static-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
```


### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CONTAINER-ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The amount of memory, in bytes, used during the time interval
- `CONTAINER-ID`: The container ID that this reading is for

Any errors are printed to Stderr.

### How it works
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system. It reads from the `memory.current` file under `sys/fs/cgroup/user.slice/user-<USER-ID>.slice/user@<USER-ID>.service/user.slice/docker-<CONTAINER-ID>.scope/`

Currently, `<USER-ID>` is set to the calling user.