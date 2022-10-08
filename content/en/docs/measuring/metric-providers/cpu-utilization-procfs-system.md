---
title: "CPU % - procfs - system"
description: "Documentation for CpuUtilizationProcfsSystemProvider of the Green Metrics Tool"
lead: ""
date: 2022-10-07T08:49:15+00:00
draft: false
images: []
weight: 110
---
### What it does

This metric provider calculates an estimate of the % total CPU usage based of the system based on the `/proc/stat` file.

### Classname
- CpuUtilizationProcfsSystemProvider

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
- `READING`: The estimated % CPU used

Any errors are printed to Stderr.

### How it works
The provider reads all the entries of the first line of the [`/proc/stat` file](https://www.kernel.org/doc/html/latest/filesystems/proc.html) and 
uses the argument the same way `htop` does it. This means that CPU Utilization is 
calcuated as:

**user_time+nice_time+system_time+irq_time+softirq_time+steal_time / wait_time,iowait_time+user_time+nice_time+system_time+irq_time+softirq_time+steal_time**

**io_wait** and **wait** are counted both as idle.

Since we want the output as a ratio that can be expressed as an integer, we multiply with 10000.
