---
title: "CPU Time - Control Groups"
description: "cgroup cpu time provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 140
---
### What it does

This metric provider calculates an estimate of the total time spent in the CPU based on the cgroups stats file of your docker containers. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Input Parameters

- args
    - `-s`: container-ids seperated by commas
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
> sudo ./static-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CONTAINER.ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`:The time spent, in microseconds, by this container in the CPU
- `CONTAINER.ID`: The container ID that this reading is for

Any errors are printed to Stderr.

### How it works
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system

The provider reads from the cpu.stat file used by your container here:

```
/sys/fs/cgroup/user.slice/user-<USER_ID>.slice/user@<USER_ID>.service/user.slice/docker-<USER_ID>.scope/cpu.stat
```

In order to work in rootless cgroup delegation must be enabled here:
`/etc/systemd/system/user@.service.d/delegate.conf`

Currently, `<USER-ID>` is assumed to be the default unix user-id of 1000