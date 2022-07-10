---
title: "Metric Providers"
description: ""
lead: ""
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu:
  docs:
    parent: "prologue"
weight: 100
toc: true
---

TODO
- What are metric providers
- Reusablity
- Structure with:
    + source
    + Makefile
    + provider.py
- Can be defined in the config.yml
    + Resolution can be set by first argument


## Example config.yml part with changed resolution for CpuCgroupContainerProvider
```bash
...
measurement:
  idle-time-start: 2
  idle-time-end: 2
  flow-process-runtime: 6000
  metric-providers:
    cpu.cgroup.container.provider.CpuCgroupContainerProvider: 10
    energy.RAPL.MSR.system.provider.EnergyRaplMsrSystemProvider: 100
    memory.cgroup.container.provider.MemoryCgroupContainerProvider: 100
    time.cgroup.container.provider.TimeCgroupContainerProvider: 100
    time.proc.system.provider.TimeProcSystemProvider: 100
...
```
    