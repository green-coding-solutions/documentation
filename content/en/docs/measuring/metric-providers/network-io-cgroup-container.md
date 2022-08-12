---
title: "Network IO - cgroup - container"
description: "Documentation for NetworkIoCgroupContainerProvider of the Green Metrics Tool"
lead: ""
date: 2022-08-04T08:49:15+00:00
weight: 160
---

### What it does
It reads the total amount of sent and received bytes from the network interface inside the assigned namespace by the cgroup of the container. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname
- NetworkIoCgroupContainerProvider

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
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system. 

It first enters the namespace via at `setns` systemcall of the root process of the container.

The relevant file it uses is: `/proc/<PROCESS-ID>/ns/net`.

After having entered the namespace the provider reads from `/proc/net/dev` and:
- parses the output
- skips all `lo` interfaces
- sums up the `r_bytes` and `t_bytes` of all other interfaces
- does NOT count dropped packets (we assume since most of the traffic is internal, that a dropped received packet shows up in another interface as sent anyway and a dropped sent packet does not attribute much to the energy consumption).

