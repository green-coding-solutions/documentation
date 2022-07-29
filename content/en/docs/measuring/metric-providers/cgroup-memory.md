---
title: "Memory - Control Groups"
description: "cgroup memory provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 130
---

### What it does
It reads the total amount of memory, in bytes, used by the cgroup of a container. More information about cgroups can be found [here](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

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
- `READING`: The amount of memory, in bytes, used during the time interval
- `CONTAINER.ID`: The container ID that this reading is for

Example output:
```
screenshot example
```

Any errors are printed to Stderr.

### How it works
The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system. It reads from the `memory.current` file under `sys/fs/cgroup/user.slice/user-<USER-ID>.slice/user@<USER-ID>.service/user.slice/docker-%s.scope/`

Currently, `<USER-ID>` is assumed to be the default unix user-id of 1000