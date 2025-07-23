---
title: "CPU Energy Package - RAPL Component"
description: "Documentation for CpuEnergyRaplMsrComponentProvider of the Green Metrics Tool"
date: 2022-06-02T08:49:15+00:00
draft: false
images: []
weight: 110
---

### What it does

This metric provider reads the energy of the CPU Package from the Running Average Power Limit (RAPL) interface via a machine specific register (MSR) that is present on most modern Intel processors. In depth information about RAPL can be found [here](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html).

This MSR keeps a running count of the energy used in a specified domain in microJoules. This metric provider specifically reads from the `energy-pkg` domain, which gives you the cumulatove energy used by the domains `energy-cores`, `energy-gpu` and some extra parts like the voltage regulator and such that also reside on the package.

### Setup
Please look at [RAPL installation]({{< relref "/docs/installation/installation-linux" >}})

### Technical specs

- Time resolution: up to 976 micro-seconds (depending on production year of the CPU)
- Energy resolution: up to 15.3 micro-Joules (depending on production year of the CPU)

### Classname

- `CpuEnergyRaplMsrComponentProvider`

### Metric Name

- `cpu_energy_rapl_msr_component`

### Input Parameters

- Args:
    - i: specifies interval in milliseconds between measurements

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP ENERGY_OUTPUT`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `ENERGY_OUTPUT`: Energy used during interval, in micro Joules
- `PACKAGE_ID`: ID of the package in case you have multiple CPU chips installed. Otherwise always *Package_0*

Example output:

```txt
1712641603443421 8092 Package_0
1712641604443831 8047 Package_0
.....
```

Any errors are printed to Stderr.

### How it works

We use a modified version of the open source code found here: ([github](https://github.com/deater/uarch-configure/blob/master/rapl-read/rapl-read.c))

First we check if the CPU is compatible by reading the cpu info from `/proc/cpuinfo` and checking against the following list of supported CPUs:

```txt
CPU_SANDYBRIDGE, CPU_SANDYBRIDGE_EP, CPU_IVYBRIDGE, CPU_IVYBRIDGE_EP, CPU_HASWELL, CPU_HASWELL_ULT, CPU_HASWELL_GT3E, CPU_HASWELL_EP, CPU_BROADWELL, CPU_BROADWELL_GT3E, CPU_BROADWELL_EP, CPU_BROADWELL_DE, CPU_SKYLAKE, CPU_SKYLAKE_HS, CPU_SKYLAKE_X, CPU_KNIGHTS_LANDING, CPU_KNIGHTS_MILL, CPU_KABYLAKE_MOBILE, CPU_KABYLAKE, CPU_ATOM_SILVERMONT, CPU_ATOM_AIRMONT, CPU_ATOM_MERRIFIELD, CPU_ATOM_MOOREFIELD, CPU_ATOM_GOLDMONT, CPU_ATOM_GEMINI_LAKE, CPU_TIGER_LAKE
```
It reads the values from `/dev/cpu/%d/msr`

Note that since it reads the energy used by the entire system, any other load that your system has during a program's usage run will also be captured in the energy measurement.
