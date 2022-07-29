---
title: "CPU - Control Groups"
description: "cgroup cpu provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 110
---
### What it does

This metric provider calculates an estimate of the % total CPU usage based on the cgroups stats file of your docker containers. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

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
- `READING`: The estimated % CPU used
- `CONTAINER.ID`: The container ID that this reading is for

Example output:
```
screenshot example
```

Any errors are printed to Stderr.

### How it works
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system

The provider reads from two files. To get the number of microseconds spent in the CPU by the container, during the interval, it reads from:

```
/sys/fs/cgroup/user.slice/user-<USER_ID>.slice/user@<USER_ID>.service/user.slice/docker-<USER_ID>.scope/cpu.stat
```

To get the total time spent by the cpu during that time interval, in Jiffies, you read from `/proc/stat`. We collect **user**, **nice**, **system**, **idle** **iowait**, **irq**, **softirq**, **steal**, **guest** (see definitions [here](https://www.idnt.net/en-US/kb/941772)), add them together, divide by _SC_CLK_TCK_ (typically 100 Hz). The percentage of the cgroup time divided by this sum is the total percentage of CPU time spent by the container.

Then it calculates the % cpu used via this formula: `container_reading * 10000 / main_cpu_reading`

In order to work in rootless cgroup delegation must be enabled here:
`/etc/systemd/system/user@.service.d/delegate.conf`

Currently, `<USER-ID>` is assumed to be the default unix user-id of 1000

### Future Plans

In our testing, we've found that Jiffies increase by about 100 per second. This gives us a granularity of 10ms when using `/proc/stat` to read the total CPU time. This can be further improved by getting the total cpu time via cgroups as well. You can see the structure of your cgroups with the command: `cd / && systemd-cgls`. There you can see that there are three main domains: *user.slice*, *init.scope* and *system.slice*. Enumerating all directories in `/sys/fs/cgroup`, which are the root cgroups, and getting the stats from there would give us a more accurate total reading.
