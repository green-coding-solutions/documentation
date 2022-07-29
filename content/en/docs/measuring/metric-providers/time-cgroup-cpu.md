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

```
Screenshot usage example << FREE ME FROM THE TORMENT OF NON-EXISTANCE >>
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CONTAINER.ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`:The time spent, in microseconds, by this container in the CPU
- `CONTAINER.ID`: The container ID that this reading is for

Example output:
```
screenshot example
```

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