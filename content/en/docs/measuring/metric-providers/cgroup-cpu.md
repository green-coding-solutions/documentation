---
title: "cgroup cpu provider"
description: "cgroup cpu provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
---
### Input Parameters

- Args
    - -s: container-ids seperated by comma
    - -i: interval in milliseconds

By default the measurement interval is 100 ms.


### Output

- Output:
    - stdout -> `TIMESTAMP READING CONTAINER.ID` 
     - TIMESTAMP -> linux timestamp to microseconds 
     - READING -> container_reading * 10000 / main_cpu_reading
       - container_reading -> reading from `"/sys/fs/cgroup/user.slice/user-%s.slice/user@%s.service/user.slice/docker-%s.scope/cpu.stat"` over interval
            - User id is assumed to be 1000 - hardcoded for now. Will not work properly if it is different
       - main_cpu_reading -> reading from `/proc/stat` over interval
    - Errors to stderr

### How it works
The cgroup CPU reporters measures the time CPU utilization in terms of time for a
given measurement interval.


```
From `/proc/stat` We are getting *Jiffies* of the system in the first line.

We collect **user**, **nice**, **system**, **idle** **iowait**, **irq**, **softirq**, **steal**, **guest** (See definitions here: https://www.idnt.net/en-US/kb/941772)

So this is what the timer of the kernel has calcuated in terms of usage distribution.

We sum that up, divide it by the _SC_CLK_TCK_ and then we divide our cgroup time with by that sum.

Typically **_SC_CLK_TCK_** is 100 Hz.

In our testsystem the Jiffies do increase by about 100 in 1 second. So this means, that 100 Jiffies / 100 Hz = 1s.
This results in a granularity of 10 ms when using `/proc/stat`.

The times in the cgroup are updated with a better granularity, but also not more often than the scheduler runs (which is **_SC_CLK_TCK_**)

A way to increase this resolution would be to use the cgroup filesystem.
In Linux with a properly setup cgroup filesystem all processes are in a cgroup.

You can view the current structure by issueing the command `cd / && systemd-cgls`

You can see that typically the three main domains: *user.slice*, *init.scope* and *system.slice* are present.

When looking at `systemd-cgtop` their usage and the distribution can be seen.

When summing up these three control groups (*/sys/fs/cgroup/user.scope/cpu.stat* + */sys/fs/cgroup/init.scope/cpu.stat* + */sys/fs/cgroup/system.scope/cpu.stat*) on a standard configured system the accuracy is quite good and the resolution of the time measurement way better.
The way to go would be to enumerate all directories in `/sys/fs/cgroup`, which are the root cgroups and get the stats from there.

At the moment we do not implement that though.



We could also divide our cgroup value by the time delta of our measurement interval, but we rather rely
on the kernel counting time.



In order to work in rootless cgroup delegation must be enabled:
/etc/systemd/system/user@.service.d/delegate.conf
```
