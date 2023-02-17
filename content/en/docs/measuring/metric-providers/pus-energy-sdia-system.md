---
title: "PSU Energy - AC - SDIA - System"
description: "Documentation for PsuEnergyAcSdiaSystemProvider of the Green Metrics Tool"
lead: ""
date: 2022-12-10T08:49:15+00:00
weight: 170
---

### What it does
It estimates the total system energy consumption (AC Power) based on the SDIA 
[linear model](https://docs.google.com/spreadsheets/d/1uCQVs8mVgfu6fcQLEttDgfqPzhCm1yuf19_9RUDuU6w/edit#gid=1126994188), which takes TDP, CPU-Chips and Utilization as input variables.

The formula works as follows:
`(CPU-Chips * TDP * Utilization) / 0.65`

*0.65* is the coefficient assumed to be the amount the CPU contributes to the
total energy consumption of a non-GPU server.

### Classname
- PsuEnergyAcSdiaSystemProvider

### Prerequisites

The provider must be configured in the `config.yml`. Please see [Configuration →]({{< relref "configuration" >}})
for further info.

In the `config.yml` file also the *CpuUtilizationProcfsSystemProvider* must be activated
 for the *PsuEnergyAcSdiaSystemProvider* to work.

### Input Parameters

- args
    - Takes no arguments

The provider cannot be run directly, it only works in conjunction with a run 
of the Green Metrics Tool.

The provider reads the `/tmp/green-metrics-tool/cpu_utilization_procfs_system.log` file
from the *CpuUtilizationProcfsSystemProvider* in order to keep overhead low and 
not to double query the utilization from the system.

### Output

Since this provider should not be run directly there it has no direct output.

The resulting data however is the wattage for the whole system (AC Power) in Watts.

This value has the same granularity as the one configured in the `config.yml` for the
*CpuUtilizationProcfsSystemProvider*

Any errors are printed to Stderr.

