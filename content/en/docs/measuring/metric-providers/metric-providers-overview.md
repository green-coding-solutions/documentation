---
title: "Metric Providers Overview"
description: ""
lead: ""
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
weight: 101
toc: true
---


### What is a Metric Provider?

A metric provider is a standalone module that can be used to measure a specific measurement metric using a unique method. Whilst they are all used in our `runner.py` module to fully measure an application, each of them can also be run independently.

### Naming convention

Metric providers should follow the naming convention of: Where, What, How, Scope

- Where - what hardware / software source
- What - "physical" unit
  + This might be actually two levels deep. For instance, if you measure AC energy we recommend doing `energy -> AC`. For network io only `io` is sufficient
- How - Hardware / Software tool or resource that you are using
  + For instance procfs, RAPL etc
- Scope - container, system, component, machine

ie. `cpu.utilization.cgroup.container`

### Setup and Structure

To use the metrics provider, the C source must be compiled. This can be done easily for all metrics providers by running the `install.sh` script in the project's root directory, or individually by running the `Makefile` in each provider's subdirectory. This will create a binary file in each metric's subdirectory.

Each metric providers to be attached and used during a run are defined in our `config.yml` file:

```yml
measurement:
  metric-providers:
    linux:
      cpu.utilization.cgroup.container.provider.CpuUtilizationCgroupContainerProvider:
        resolution: 100
      cpu.energy.RAPL.MSR.system.provider.CpuEnergyRaplMsrSystemProvider:
        resolution: 100
#      psu.energy.ac.xgboost.system.provider.PsuEnergyAcXgboostSystemProvider:
#        resolution: 100
         # This is a default configuration. Please change this to your system!
#        CPUChips: 1
#        HW_CPUFreq: 3100
#        CPUCores: 28
#        TDP: 150
#        HW_MemAmountGB: 16
```

The dimension of the resolution is milliseconds. Change this number to have a smaller or larger time window between measurements for that specific provider.

The metric providers are written as C programs with a Python wrapper, and live under `metric_providers/` in the subdirectory that matches the `config.yml`. The directory contains the following files:

```txt
- <metric-providers-path>:
    - source.c
    - Makefile
    - provider.py
```

The `source.c` is the main sourcecode for the metric provider, the `Makefile` can be used to generate the needed binary, and the `provider.py` is the python wrapper.

### How to Use

The `runner.py` will instrument all the metric providers automatically for you. It will save all the measured data into the postgres database.

If you wish to run them independently however, you can do so as a C program or with the python wrapper. The C program will output all of its data as a continuous stream to Stdout.

#### C

After building the metric provider binary via the `Makefile` or `install.sh` script, simply run it.

It will begin reading the metrics and printing them to Stdout.

If the metric provider has specific or needed flags (such as container-id), you may provide them. Some metrics gather their data from container-level information, while others read system-wide metrics. Those that read at a container-level will need the container-ids passed in as an input parameter with the `-s` flag, with each container-id separated with a comma. See the specific Metric Provider's documentation for more information.

The format of the output will be: `<timestamp> <metric_reading> <optional: container-id>`:

Some special providers may register additional output fields, that are considered internal atm.

```bash
> sudo ./metric-provider-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a

1659366713420657 4 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b
1659366713420657 234 c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
1659366713521111 3 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b
1659366713521111 273 c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a

```

The timestamp will always be a UNIX timestamp, down to the microsecond. The metric_reading output and units are specific to each metric, and the container-id will also only be shown if the metric reads on a container level (otherwise it should say SYSTEM).

#### Python

To use the Python wrapper, call the `start_profiling` method when you wish to begin the profiling, and then `stop_profiling` when you wish to stop.

You may pass in a container-id into `start_profiling` if needed. It writes the output of the metrics to `/tmp/green-metrics-tool/{self._metric_name}.log"`, which can be read programmatically with the `read_metrics function`.

### Writing your own metric provider

Create your own metric provider by implementing a class that inherits `BaseMetricProvider` from `metric_providers/base.py`.  
Please make sure that you adhere the naming convention so that it can be displayed properly in the frontend.  
