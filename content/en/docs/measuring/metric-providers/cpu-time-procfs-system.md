---
title: "CPU Time - procfs - system"
description: "Documentation of CpuTimeProcfsSystemProvider of the Green Metrics Tool"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 132
---

### What it does

This metric provider reads the total time spent in the CPU based on the system `/proc/stat` file.

### Classname

- `CpuTimeProcfsSystemProvider`

### Metric Name

- `cpu_time_procfs_system`

### Input Parameters

- args
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`:The time spent, in microseconds, by this container in the CPU

Any errors are printed to Stderr.

### How it works

The provider reads from `/proc/stat`. We collect **user**, **nice**, **system**, **idle** **iowait**, **irq**, **softirq**, **steal** (see definitions [here](https://www.idnt.net/en-US/kb/941772)), and add them together over the measurement period.
