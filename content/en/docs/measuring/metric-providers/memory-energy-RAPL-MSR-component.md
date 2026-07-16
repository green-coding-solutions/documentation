---
title: "Memory Energy - RAPL Component"
description: "Documentation for MemoryEnergyRaplMsrComponentProvider of the Green Metrics Tool"
date: 2022-06-02T08:49:15+00:00
draft: false
images: []
weight: 170
---
### What it does

This metric provider reads the DRAM energy from the Running Average Power Limit (RAPL) interface via a machine specific registers (MSR). Unlike the CPU package domain, the DRAM domain is only exposed by a subset of Intel processers. AMD processors do not expose it at all and the provider will refuse to start on them. In depth information about RAPL can be found in the [Intel Software Developer Manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html).

This MSR keeps a running count of the energy used in a specified domain in microJoules. This metric provider specifically reads from the DRAM domain (`MSR_DRAM_ENERGY_STATUS`, `0x619`), which gives you the energy used by the memory controller and the attached DIMMs.

### Setup

Please look at [RAPL installation]({{< relref "/docs/installation/installation-linux" >}})

### Technical specs

- Time resolution: up to 976 micro-seconds (depending on production year of the CPU)
- Energy resolution: up to 15.3 micro-Joules (depending on production year of the CPU)

### Classname

- `MemoryEnergyRaplMsrComponentProvider`

### MetricName

- `memory_energy_rapl_msr_component`

### Input Parameters

- Args:
  - i: specifies interval in milliseconds between measurements
  - d: Must be set to activate the DRAM reading mode.

```bash
./metric-provider-binary -i 100 -d
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP ENERGY_OUTPUT`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `ENERGY_OUTPUT`: Energy used during interval, in micro Joules
- `DRAM_ID`: ID of the DRAM controller measured in case you have multiple memory controllers installed. Otherwise always. Otherwise *DRAM_0*

Example output:

```txt
1712641603443421 2092 DRAM_0
1712641604443831 2047 DRAM_0
```

Any errors are printed to Stderr.

### How it works

We use a modified version of the open source code found here: ([github](https://github.com/deater/uarch-configure/blob/master/rapl-read/rapl-read.c))

First we detect the CPU by reading the cpu info from `/proc/cpuinfo`. The detected model is then checked against the list of CPUs that expose a DRAM domain:

```txt
CPU_SANDYBRIDGE_EP, CPU_IVYBRIDGE_EP, CPU_HASWELL, CPU_HASWELL_ULT, CPU_HASWELL_GT3E, CPU_HASWELL_EP, CPU_BROADWELL, CPU_BROADWELL_GT3E, CPU_BROADWELL_EP, CPU_SKYLAKE, CPU_SKYLAKE_HS, CPU_SKYLAKE_X, CPU_KNIGHTS_LANDING, CPU_KNIGHTS_MILL, CPU_KABYLAKE_MOBILE, CPU_KABYLAKE, CPU_ATOM_GOLDMONT, CPU_ATOM_GEMINI_LAKE, CPU_ATOM_DENVERTON
```

Models that the provider knows but that are not in this list — the non-EP *Sandy Bridge* / *Ivy Bridge*, *Broadwell DE*, the *Silvermont*, *Airmont*, *Merrifield* and *Moorefield* Atoms, *Tiger Lake* and AMD family 17h / 19h — have no DRAM domain configured. The provider will exit with *DRAM not available for your processer* on them.

It reads the values from `/dev/cpu/%d/msr`

Note that since it reads the energy used by the entire system, any other load that your system has during a program's usage run will also be captured in the energy measurement.
