---
title: "PSU Energy - DC - RAPL Machine"
description: "Documentation for PsuEnergyAcMcpMachineProvider of the Green Metrics Tool"
lead: ""
date: 2024-04-08T08:16:35+0000
draft: false
images: []
weight: 214
---


### What it does

This metric provider reads the energy of the Platform (PSYS) domain from the Running Average Power Limit (RAPL) interface via a machine specific register (MSR) that is present on some Intel processor based notebook devices. 
In depth information about RAPL can be found [here](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html).

This MSR keeps a running count of the energy used in a specified domain in microJoules. This metric provider specifically reads from the `energy-psys` domain, which gives you the energy used by potentially the whole machine. The exact implementation what exactly falls under the *PSYS* domain is up to the manufacturer of the machine and in doubt you should contact the manufacturer.

We have tested this domain on modern [Framework](https://frame.work/de/en) notebooks and the domain includes here at least all of the CPU, DRAM as well as the display.

### Setup
Please look at [RAPL installation]({{< relref "/docs/installation/installation-linux" >}})

### Technical specs

- Time resolution: up to 976 micro-seconds (depending on production year of the CPU)
- Energy resolution: up to 15.3 micro-Joules (depending on production year of the CPU)

### Classname

- `PsuEnergyDcRaplMsrMachineProvider`

### Metric Name

- `psu_energy_dc_rapl_msr_machine`

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
- `PSYS_ID`: ID of the PSYS domain. Actually this should always be `PSYS_0`, since we have never seen a device with more
  then one domain or more than one CPU chip (which also creates multiple domains in case), so we could not verify. 
  If you experience inconsistencies here contact us please.

Example output:

```txt
1712641603443421 8092 PSYS_0
1712641604443831 8047 PSYS_0
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
