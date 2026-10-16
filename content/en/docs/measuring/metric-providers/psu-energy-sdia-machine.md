---
title: "PSU Energy - AC - SDIA - Machine"
description: "Documentation for PsuEnergyAcSdiaMachineProvider of the Green Metrics Tool"
date: 2022-12-10T08:49:15+00:00
weight: 215
---

### What it does

It estimates the total machine energy consumption (AC Power) based on the SDIA
[linear model](https://docs.google.com/spreadsheets/d/1uCQVs8mVgfu6fcQLEttDgfqPzhCm1yuf19_9RUDuU6w/edit#gid=1126994188), which takes TDP, CPU-Chips and Utilization as input variables.

The formula works as follows:
`(CPU-Chips * TDP * Utilization) / 0.65`

*0.65* is the coefficient assumed to be the amount the CPU contributes to the
total energy consumption of a non-GPU server.

### Classname

- `PsuEnergyAcSdiaMachineProvider`

### Metric Name

- `psu_energy_ac_sdia_machine`

### Prerequisites

The provider must be configured in the `config.yml`. Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}})
for further info.

In the `config.yml` file also a system CPU utilization provider must be activated for the
*PsuEnergyAcSdiaMachineProvider* to work. Depending on the operating system this is one of:

- *CpuUtilizationProcfsSystemProvider* (`cpu_utilization_procfs_system`) on Linux
- *CpuUtilizationMachSystemProvider* (`cpu_utilization_mach_system`) on macOS
- *CpuUtilizationWin32SystemProvider* (`cpu_utilization_win32_system`) on Windows

### Input Parameters

- args
  - Takes no arguments

The provider cannot be run directly, it only works in conjunction with a run
of the Green Metrics Tool.

The provider reads the log file of the system CPU utilization provider from the metrics folder of the
run (`/tmp/green-metrics-tool/metrics/` on Linux and macOS) in order to keep overhead low and not to
double query the utilization from the system. It uses the first of these files that exists:

- `cpu_utilization_procfs_system.log`
- `cpu_utilization_mach_system.log`
- `cpu_utilization_win32_system.log`

### Output

Since this provider should not be run directly there it has no direct output.

The resulting data however is the energy of the whole machine (AC Power) in micro Joules.

This value has the same granularity as the one configured in the `config.yml` for the
system CPU utilization provider.

Any errors are printed to Stderr.
