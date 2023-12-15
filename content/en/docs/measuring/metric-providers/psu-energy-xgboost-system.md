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
The underlying XGBoost model can be found [on our GitHub](https://github.com/green-coding-berlin/spec-power-model).
### Classname

- PsuEnergyAcXgboostSystemProvider

### Prerequisites & Installation

This provider is included as a submodule in the Green Metrics Tool and should have been checked out with the
initial install command of this manual. If not, run:

```bash
git submodule update --init
```

If you don't have them already, you need to install some python libraries:

```bash
python3 -m pip install -r ~/green-metrics-tool/metric_providers/psu/energy/ac/xgboost/machine/model/requirements.txt
```

The provider must be configured in the `config.yml`. It must be supplied with the machine params in the `config.yml` file:

- CPUChips
- HW_CPUFreq
- CPUCores
- TDP
- HW_MemAmountGB

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}})
for further info.

In the `config.yml` file the *CpuUtilizationProcfsSystemProvider* must also be activated
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

