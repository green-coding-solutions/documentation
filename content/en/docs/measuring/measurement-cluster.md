---
title: "Measurement Cluster"
description: "Setting up your measurement cluster - Our measurement cluster"
lead: "Measurement Cluster"
date: 2023-04-10T08:49:15+00:00
weight: 840
toc: true
---


## Our Measurement Cluster

Our Measurement Cluster runs on [NOP Linux](https://www.green-coding.io/blog/nop-linux/) and is the driver behind our [Hosted Service]({{< relref "measuring-service" >}}).

We have the following machines available for running measurements in our cluster:

- **CO2 Profiling (DVFS ON, TB ON, HT ON) - Esprimo P956**
    + Use Case: For profiling of a software to get a value for an off-the-shelf Ubuntu system with default configuration
    + Vendor: Fujitsu ESPRIMO P956
    + OS: Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Single-Tenant Server 
    + Special: **Blue Angel compatible**
    + CPU: Intel(R) Core(TM) i5-6500 CPU @ 3.20GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: On
    + C-States: All
    + Memory: 16 GB
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

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
    + C-States: C0 only
    + Memory: 8 GB 
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=9784422b-f4c6-42f3-addd-9e4c0833da74)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

---

- **Micro Benchmarking (DVFS OFF, TB OFF, HT OFF) - TX1330 M3**
    + Use Case: For micro benchmarking of a software where configuration is tuned for reproducability. Reporters are set to 1ms resolution and limited to RAPL CPU / Memory
    + Vendor: Fujitsu TX1330 M3
    + Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Single-Tenant Server 
    + CPU: Intel(R) Xeon(R) CPU E3-1240L v5 @ 2.10GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 2.1 GHz)
    + C-States: C0 only
    + Memory: 8 GB
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=262f1df0-ac6c-4e74-8d08-9c13c0b25293)
    + Metrics Provider for Machine Power: None

---

- **Fujitsu TX1330 M3 - IPMI**
    + Use Case: For profiling of a software to get a value for an off-the-shelf Ubuntu system with default configuration
    + Vendor: Fujitsu TX1330 M3
    + OS: Ubuntu 22.04 (default)
    + Type: Single-Tenant Server 
    + CPU: Intel(R) Xeon(R) CPU E3-1220 v6 @ 3.00GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + Memory: 16 GB
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}}) & [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})

---

- **Palit GPU**
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

- **Quanta Leopard-DDR3 - Currently unavailable**
    + Use Case: Heavy parallelized workloads / HPC
    + Type: 48-Thread Multi-Tenant Server 
    + OS: Ubuntu 22.04 (default)
    + Special: **SoftAWERE compatible**
    + CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz (2x)
    + Cores: 24
    + Threads: 48
    + Hyper-Threading: On
    + Turbo Boost: Off
    + Memory: 32 GB
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=72596fdf-b393-4cef-bb98-45679ae928f5)
    + Metrics Provider for Machine Power: [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})


## Setting up your own measurement cluster

Please refer to the page [Installation of a Cluster]({{< relref "/docs/installation/installation-cluster" >}})
