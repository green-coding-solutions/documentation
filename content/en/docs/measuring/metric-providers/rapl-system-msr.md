---
title: "RAPL system MSR"
description: "RAPL system MSR metrics provider documentation"
lead: ""
date: 2022-06-02T08:49:15+00:00
draft: false
images: []
---

### Input Parameters
- Args:
    - c: specifies which core to measure
        - test this more before documenting
    - i: specifies interval in milliseconds between measurements
        - from RAPL documentation: RAPL can only measure until 1ms resolution 

### Output

### How it works

- Checks for CPU compatability by looking at `/proc/cpuinfo`
- list of currently supported cpu models:
    CPU_SANDYBRIDGE, CPU_SANDYBRIDGE_EP, CPU_IVYBRIDGE, CPU_IVYBRIDGE_EP, CPU_HASWELL, CPU_HASWELL_ULT, CPU_HASWELL_GT3E, CPU_HASWELL_EP, CPU_BROADWELL, CPU_BROADWELL_GT3E, CPU_BROADWELL_EP, CPU_BROADWELL_DE, CPU_SKYLAKE, CPU_SKYLAKE_HS, CPU_SKYLAKE_X, CPU_KNIGHTS_LANDING, CPU_KNIGHTS_MILL, CPU_KABYLAKE_MOBILE, CPU_KABYLAKE, CPU_ATOM_SILVERMONT, CPU_ATOM_AIRMONT, CPU_ATOM_MERRIFIELD, CPU_ATOM_MOOREFIELD, CPU_ATOM_GOLDMONT, CPU_ATOM_GEMINI_LAKE, CPU_TIGER_LAKE
```
TODO
- Reads from `/dev/cpu/%d/msr`
- Code mostly pulled from SOURCE
- Currently reads out only energy/power-pkg, which gives the whole CPU package energy of all cores
- We use a modified version of the RAPL reading code provided by the open source repository here:
https://github.com/deater/uarch-configure/tree/master/rapl-read

- support is processor dependenent -> if you have a newer processor model that is not listed

- checks our cpu from /proc/cpuinfo

- RAPL reads the total energy used during the run, which means any other load your system has during the run will also be captured in the energy reading

- prints to STDOUT - "TIMESTAMP ENERGY_OUTPUT"
    - TIMESTAMP is a unix timestamp, to microseconds
    - ENERGY_OUTPUT is in mJ, as int

- Could be extended to capture DRAM, not available on all platforms => Move this to Joint Research docu project
```