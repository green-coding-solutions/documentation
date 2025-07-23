---
title: "Installation on Windows"
description: "A description on how to install the GMT on Windows machines"
date: 2023-12-04T01:49:15+00:00
weight: 304
toc: true
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
Running the GMT on Windows with WSL is only meant for development and testing of usage scenarios! It is not possible to use this setup for actual measurements. However, once you have a working usage scenario you can hand that in on our <a href=/docs/measuring/measuring-service/>measurement cluster</a> for a proper measurement.
{{< /callout >}}

GMT can only run on Windows with the [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/) (WSL). Before installing GMT make sure you have a working WSL environment.

With WSL you are working with a real Linux distribution (e.g. Ubuntu). Therefore, the most installation steps are equal to the ones documented in [Installation on Linux →]({{< relref "installation-linux#downloading-and-installing-required-packages" >}}). On this page we only document the things that are different.

If you ever get stuck during this installation, be sure to reboot WSL once. It may help to correctly load some configurations and/or daemons.

## Installation of Docker

There are two different ways to install and use Docker:

- Docker Desktop for Windows (with WSL 2 backend)
- Native Docker installation inside of WSL 2

[Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/) provides an easy way to install Docker on your system.
Using it for GMT comes with the following issues:

- possible license issues (commercial use of Docker Desktop in larger enterprises required a paid subscription)
- resource overhead (due to extra VM `docker-desktop`)
- the metric provider [Network IO - cgroup - container]({{< relref "/docs/measuring/metric-providers/network-io-cgroup-container" >}}) does not work due to the virtualization barrier between the container processes (running inside the special environment `docker-desktop`) and the default WSL environment (e.g. `ubuntu`)
  - PID resolution fails: `cgroup.procs` files contain placeholder values (typically "0") instead of actual container PIDs
  - Namespace access blocked: `/proc/PID/ns/net` files don't exist in WSL2's filesystem

If one of the mentioned issues is a problem for you, consider installing Docker natively inside of your prefered WSL 2 distribution (e.g. [Ubuntu](https://docs.docker.com/engine/install/ubuntu/)).

## Setup

Before following the setup instructions given in [Installation on Linux →]({{< relref "installation-linux#setup" >}}), you have to first change your WSL configuration.

### Change WSL config

Required changes:

- Disable automatic generation of hosts file
- Enable systemd (if that's not already the case)

```bash
sudo vim /etc/wsl.conf
```

Add the following lines:

```ini
[network]
generateHosts = false

[boot]
systemd = true
```

Restart:

```bash
wsl.exe --shutdown
```

References:

- [https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/](https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/)
- [https://learn.microsoft.com/en-us/windows/wsl/systemd](https://learn.microsoft.com/en-us/windows/wsl/systemd)

### Add hosts entries to Windows

To be able to access the frontend and the API of the GMT, you have to add the URLs to the hosts file on your Windows host system: `C:\Windows\System32\drivers\etc\hosts`

```plain
127.0.0.1 green-coding-postgres-container
127.0.0.1 api.green-coding.internal metrics.green-coding.internal
```

### Enable CGroups v2

This is an optional step, but necessary to be able to get container specific metrics like CPU utilization, memory usage, network transfer and disk I/O (see section [Metric providers](#metric-providers) below for more information).

Create the file `%USERPROFILE%\.wslconfig` (or edit it) and add the following content:

```plain
[wsl2]
kernelCommandLine = systemd.unified_cgroup_hierarchy=1 cgroup_no_v1=all
```

Then restart WSL (`wsl.exe --shutdown`).

You can check which cgroup version is activated via:

```sh
mount -l | grep cgroup
```

### Metric providers

With WSL hardware-near metric providers like RAPL are not available.
However, for testing your usage scenarios you can use at least the following metric providers:

- System CPU utilization via procfs
  - Config: `cpu.utilization.procfs.system.provider.CpuUtilizationProcfsSystemProvider`
  - Documentation: [Measuring/Metric Providers/CPU % - procfs - system]({{< relref "/docs/measuring/metric-providers/cpu-utilization-procfs-system" >}})
- Container CPU utilization via cgroupv2
  - Config: `cpu.utilization.cgroup.container.provider.CpuUtilizationCgroupContainerProvider`
  - Documentation: [Measuring/Metric Providers/CPU % - cgroup - container]({{< relref "/docs/measuring/metric-providers/cpu-utilization-cgroup-container-provider" >}})
- Container memory usage via cgroupv2
  - Config: `memory.used.cgroup.container.provider.MemoryUsedCgroupContainerProvider`
  - Documentation: [Measuring/Metric Providers/Memory Used - cgroup - container]({{< relref "/docs/measuring/metric-providers/memory-used-cgroup-container" >}})
- Container network I/O via cgroupv2
  - **only available with native Docker installation, not Docker Desktop for Windows**
  - Config: `network.io.cgroup.container.provider.NetworkIoCgroupContainerProvider`
  - Documentation: [Measuring/Metric Providers/Network IO - cgroup - container]({{< relref "/docs/measuring/metric-providers/network-io-cgroup-container" >}})
- Container disk I/O via cgroupv2
  - Config: `disk.io.cgroup.container.provider.DiskIoCgroupContainerProvider`
  - Documentation: tbd.
- Machine energy consumption via XGBoost (ML-based estimation)
  - Config: `psu.energy.ac.xgboost.machine.provider.PsuEnergyAcXgboostMachineProvider`
  - Documentation: [Measuring/Metric Providers/PSU Energy - AC - XGBoost - Machine]({{< relref "/docs/measuring/metric-providers/psu-energy-xgboost-machine" >}})

You have to disable all other providers in your `config.yml`.
