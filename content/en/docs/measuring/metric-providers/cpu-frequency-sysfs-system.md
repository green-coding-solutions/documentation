---
title: "CPU Frequency - sysfs - core"
description: "Documentation of CpuFrequencySysfsCoreProvider for the Green Metrics Tool"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 115
---
### What it does

This metric provider reads the current CPU frequency from the Linux *sysfs* subsystem for every core. 
It does this throug a simple bash script just *cat-ting* the file endpoint.

### Classname
- CpuFrequencySysfsCoreProvider

### Input Parameters

- args
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
> ./get-scaling-cur-freq.sh -i 100
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CORE`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The current frequency of the core in *Hz*
- `CORE`: The core ID assigned by the Linux *sysfs*

Any errors are printed to Stderr.

### How it works
Linux offers the current frequency of the cores as a read-out of a processor internal register to the user-space in the
*sysfs*. We just read this file endpoint periodically.


### Caveats
If you have very many cores you will generate a lot of data which is tricky to interpret as Linux constantly swaps 
cores and measurements are not directly comparable core-to-core to each other.

For most user the detail output of this provider will rather be noise than valueable data.

We recommend to either only look at the aggreagate data to understand how the cores behave individually or only 
turn the provider on if you want to debug the behaviour of your measurement.
