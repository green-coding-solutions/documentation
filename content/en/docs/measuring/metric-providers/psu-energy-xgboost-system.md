---
title: "PSU Energy - AC - XGBoost - System"
description: "Documentation for PsuEnergyAcXgboostSystemProvider of the Green Metrics Tool"
lead: ""
date: 2022-08-04T08:49:15+00:00
weight: 162
---

### What it does

It estimates the total system energy consumption (AC Power) based on training
data from the [SPECPower database](https://www.spec.org/power_ssj2008).
The underlying XGBoost model can be found [on our GitHub](https://github.com/green-coding-berlin/spec-power-model)

### Classname

- PsuEnergyAcXgboostSystemProvider

### Prerequisites

The provider must be configured in the `config.yml`. Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}})
for further info.

In the `config.yml` file also the *CpuUtilizationProcfsSystemProvider* must be activated
 for the *PsuEnergyAcXgboostSystemProvider* to work.

### Input Parameters

- args
    - Takes no arguments

If you want to run the provider directly we advise that you rather check
out it's main repository: [XGBoost SPECPower Model documentation](https://github.com/green-coding-berlin/spec-power-model)

The provider reads the `/tmp/green-metrics-tool/cpu_utilization_procfs_system.log` file
from the *CpuUtilizationProcfsSystemProvider* in order to keep overhead low and
not to double query the utilization from the system.

### Output

Since this provider should not be run directly there it has no direct output.

The resulting data however is the wattage for the whole system (AC Power) in Watts.

This value has the same granularity as the one configured in the `config.yml` for the
*CpuUtilizationProcfsSystemProvider*

Any errors are printed to Stderr.

