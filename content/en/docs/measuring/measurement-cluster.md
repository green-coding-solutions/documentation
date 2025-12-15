---
title: "Measurement Cluster"
description: "Setting up your measurement cluster - Our measurement cluster"
date: 2023-04-10T08:49:15+00:00
weight: 480
toc: true
---


## Our Measurement Cluster

Our Measurement Cluster runs on [NOP Linux changes →]({{< relref "nop-linux" >}}) and is the driver behind our [Hosted Service]({{< relref "measuring-service" >}}).

We have the following machines available for running measurements in our cluster:

- **CO2 Profiling (DVFS ON, TB ON, HT ON) - Esprimo P956**
  + Use Case: For profiling of a software to get a value for an off-the-shelf Ubuntu system with default configuration
  + Vendor: Fujitsu ESPRIMO P956
  + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
  + Type: Single-Tenant Server
  + CPU: Intel(R) Core(TM) i5-6500 CPU @ 3.20GHz
  + Cores: 4
  + Threads: 4
  + Hyper-Threading: N/A
  + Turbo Boost: Off
  + DVFS: On
  + C-States: All
  + Memory: 16 GB
  + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
  + Special: **Blue Angel compatible** for Server applications

---

- **CO2 Benchmarking (DVFS OFF, TB OFF, HT OFF) - TX1330 M2**
  + Use Case: For benchmarking of a software where configuration is tuned for reproducability
  + Vendor: Fujitsu TX1330 M2
  + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
  + Type: Single-Tenant Server
  + CPU: Intel(R) Xeon(R) CPU E3-1240L v5 @ 2.10GHz
  + Cores: 4
  + Threads: 4
  + Hyper-Threading: Off
  + Turbo Boost: Off
  + DVFS: Off (Fixed to 2.1 GHz)
  + C-States: All
  + Memory: 8 GB
  + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=9784422b-f4c6-42f3-addd-9e4c0833da74)
  + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
  + Special: **Blue Angel compatible** for Client-Server and Server applications

---

- **Micro Benchmarking (DVFS OFF, TB OFF, HT OFF) - TX1330 M2**
  + Use Case: For micro benchmarking of a software where configuration is tuned for reproducability. Reporters are set to 2 ms sampling_rate and limited to RAPL CPU / Memory as well as network I/O per cgroup
  + Vendor: Fujitsu TX1330 M2
  + Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
  + Type: Single-Tenant Server
  + CPU: Intel(R) Xeon(R) CPU E3-1240L v5 @ 2.10GHz
  + Cores: 4
  + Threads: 4
  + Hyper-Threading: Off
  + Turbo Boost: Off
  + DVFS: Off (Fixed to 2.1 GHz)
  + C-States: C0-C1
  + Memory: 8 GB
  + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=262f1df0-ac6c-4e74-8d08-9c13c0b25293)
  + Metrics Provider for Machine Power: None

---

- **GUI/Desktop Applications (DVFS ON, TB ON, HT OFF) - TX1330 M3**
  + Use Case: For profiling of a GUI / Desktop software that uses X11 or Wayland window management systems
  + Vendor: Fujitsu TX1330 M3
  + OS: Ubuntu 24.04 (default) with Wayland Window manager
  + Type: Single-Tenant Server
  + CPU: Intel(R) Xeon(R) CPU E3-1220 v6 @ 3.00GHz
  + Cores: 4
  + Threads: 4
  + Hyper-Threading: N/A
  + Turbo Boost: On
  + DVFS: Off (Fixed to 3.0 GHz)
  + C-States: All
  + Memory: 16 GB
  + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}}) / [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})
  + Special: **Blue Angel compatible** for Client-Server, Server and Desktop applications

---

- **ML/AI Profiling (DVFS ON, TB ON, HT OFF) - GTX-1080 - [PREMIUM]**
  + Use Case: For GPU measurements and AI training measurements
  + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
  + Type: Desktop-PC
  + CPU: Intel(R) Core(TM) i5-9600K CPU @ 3.70GHz
  + Cores: 6
  + Threads: 6
  + Hyper-Threading: N/A
  + Turbo Boost: On
  + Memory: 32 GB
  + Graphics: GeForce GTX 1080
    * Installed *CUDA* version: 12.2
    * *NVIDIA* kernel driver version 535.274.02
    * VRAM: 8 GB
  + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}}) & [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})
  + Special: **Blue Angel compatible** for Server applications

### Old Machines

- **Palit GPU - (Phased out Early 2025)**
  + Use Case: For GPU measurements and AI training measurements
  + OS: Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
  + Type: Desktop-PC
  + CPU: Intel(R) Core(TM) i7 CPU 870 @ 2.93GHz
  + Cores: 4
  + Threads: 8
  + Hyper-Threading: On
  + Turbo Boost: On
  + Memory: 12 GB
  + Graphics: Palit GF110 (GeForce GTX 570)
    * Installed *CUDA* version: 12
    * *NVIDIA* kernel driver version 390
  + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}}) & [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})

---

- **Quanta Leopard-DDR3 - (Phased out Early 2025)**
  + Use Case: Heavy parallelized workloads / HPC
  + Type: 48-Thread Multi-Tenant Server
  + OS: Ubuntu 22.04 (default)
  + CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz (2x)
  + Cores: 24
  + Threads: 48
  + Hyper-Threading: On
  + Turbo Boost: Off
  + Memory: 32 GB
  + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=72596fdf-b393-4cef-bb98-45679ae928f5)
  + Metrics Provider for Machine Power: [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})
  + Special: **SoftAWERE compatible**

## How to choose

### Profiling Machines

These machines are configured to be best representative of an off-the-shelf energy configuration.

This means:

- CPU Power Hungry but user friendly features like TurboBoost are on
- Low-Load multi-tasking optimizing features like HyperThreading are turned on
- Frequency Limits and C-State-Limits which typically make workloads more reproducible
  for all tenants (and thus are typically activated in the cloud) are not set.

You should choose these kind of machines to get an idea of how much actual energy an application might be using on an off-the-shelf installation. This energy value is thus very representative for desktop, home user or shared hosting situations.

It is also very good to show how good your software can leverage sleep states or how good it mitigates wakeups and thus highlight it's power saving features.

### Benchmarking Machines

These machines are configured to increase reproducability by turning off some variance introducing features but still allow a reasonable difference between low load and high load scenarios on the machine

- Strongly non linear features like TurboBoost and DVFS are turned off
- Frequency is limited to only the base clock rate of the CPU
- C-States are limited to C1 reduce latency from wakeups, but still let CPU not stay in a spin-lock

You should choose these machine types if you want have strongly reproducible runs that are not impacted by home user configurations like power saving features. This also corresponds to configurations of most cloud vendors and thus are more represeantative of a cloud workload.

Also consider to choose a machine that has the metric providers with sampling rates apt for the effect you want to capture. See [Sampling Rate Best Practices]({{< relref "best-practices/#3-sampling-rate">}})for more details.

Drawbacks are that it cannot show the full potential how good an application leverages power saving features.

### HPC Benchmarking

These machines are configured for extreme compute scenarios effectively turning off all latency introducing features completely. Optionally some compute power improvements features like Pre-Fetching can be enabled

HPC Benchmarking machines are only available in the enterprise plan as the must be configured to the users request. If you plan to make HPC Benchmarking on our cluster please contact us and send us your desired CPU, DRAM and GPU configuration and power capping settings.

## Setting up your own measurement cluster

Please refer to the page [Installation of a Cluster]({{< relref "/docs/cluster/installation" >}})
