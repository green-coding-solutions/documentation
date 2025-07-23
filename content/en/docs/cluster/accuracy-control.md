---
title: "Accuracy Control"
description: "How to ensure that measurements in cluster always have low deviation"
date: 2023-06-26T01:49:15+00:00
weight: 1004
toc: false
---

When using the *client* mode the cluster expects a *Measurement Control Workload* to be set to determine if the cluster accuracy has deviated from the expected baseline.

This is done by running a defined workload and checking the standard deviation over a defined window of measurements.

We recommend having your machines setup with our [NOP Linux changes →]({{< relref "nop-linux" >}}) and utilize the following setting by using our provided control workload:

```yml
cluster:
  client:
    ...  
    time_between_control_workload_validations: 21600
    send_control_workload_status_mail: True
    ...
    control_workload:
      name: "Measurement control Workload"
      uri: "https://github.com/green-coding-solutions/measurement-control-workload"
      filename: "usage_scenario.yml"
      branch: "main"
      comparison_window: 5
      phase: "004_[RUNTIME]"
      metrics:
        psu_energy_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        psu_power_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_power_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_energy_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_energy_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        psu_co2_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        network_total_cgroup_container:
          threshold: 10000 # 10 kB
          type: stddev
        phase_time_syscall_system:
          threshold: 0.01 # 1%
          type: stddev_rel
```

- `time_between_control_workload_validations` **[integer]**: Time in seconds until control workload shall be run again to check measurement std.dev.
- `send_control_workload_status_mail` **[boolean]**: Send an email with debug information about current std.dev.
- `control_workload` **[dict]**: (Dictionary of settings for measurement control workload)
  + `name` **[string]**: The name of the workload. Will show up in the runs list as the name
  + `uri` **[URI]**: URI to the git repo of the control workload.
  + `filename` **[a-zA-Z0-9_]**: The filename of the *usage scenario* file in the repo. Default is usually `usage_scenario.yml`
  + `branch` **[git-branch]**: The branchname of the repo to check out
  + `comparison_window` **[integer]**: The amount of previuous measurements to include in the std.dev. calculations.
  + `phase` **[str]**: The phase to look at. default is *004_[RUNTIME]*. We do not recommend to change this unless you have a custom defined phase you want to look at.
  + `metrics` **[dict]**: Contains a dictionary of all the metrics you want to check the STDDEV or relative STDDEV. Every metric is looked at individually and if the thresshold is exceeded of any of them the cluster will pause further job processing. Checks can be either relative or absolute. We recommend using relative where possible and absolute only of you very small values for the relevant metric and even small changes will lead to high relative changes. We further recommend using the default set as defined above if you have these metric providers enabled. If you do not have these providers available we recommend choosing at least one `psu_energy_...` provider that actually measures and does not estimation. The names are found in the *Metric Name* section of the respective metric provider.\
  Example: [RAPL CPU →]({{< relref "/docs/measuring/metric-providers/cpu-energy-RAPL-MSR-component" >}}) is `cpu_energy_rapl_msr_component`
  