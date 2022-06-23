---
title: "cgroup cpu provider"
description: "cgroup cpu provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
---

TODO
Reads from `/sys/fs/cgroup/user.slice/user-%s.slice/user@%s.service/user.slice/docker-%s.scope/memory.current
and from `/proc/stat`

From `/proc/stat` We are getting *Jiffies* of the system in the first line.

We collect **user**, **nice**, **system**, **idle** **iowait**, **irq**, **softirq**, **steal**, **guest** (See definitions here: https://www.idnt.net/en-US/kb/941772)

So this is what the timer of the kernel has calcuated in terms of usage distribution.

We sum that up, divide it by the _SC_CLK_TCK_ and then we divide our cgroup time with by that sum.

We could also divide our cgroup value by the time delta of our measurement interval, but we rather rely
on the kernel counting time.



In order to work in rootless cgroup delegation must be enabled:
/etc/systemd/system/user@.service.d/delegate.conf
```
