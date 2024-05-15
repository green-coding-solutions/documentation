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

- **Fujitsu ESPRIMO P956**
    + Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Single-Tenant Server 
    + Blue Angel compatible
    + CPU: Intel(R) Core(TM) i5-6500 CPU @ 3.20GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + Memory: 16 GB
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=9d250a5f-1f01-42a2-926e-e3f9b216ed5a)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

---

- **Fujitsu TX1330 M2**
    + Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Single-Tenant Server 
    + CPU: Intel(R) Xeon(R) CPU E3-1240L v5 @ 2.10GHz
    + Cores: 4
    + Threads: 8
    + Hyper-Threading: On
    + Turbo Boost: Off
    + Memory: 8 GB 
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=9784422b-f4c6-42f3-addd-9e4c0833da74)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

---

- **Fujitsu TX1330 M3**
    + Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Single-Tenant Server 
    + CPU: Intel(R) Xeon(R) CPU E3-1220 v6 @ 3.00GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + Memory: 16 GB
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=8a30b1bd-8c54-4c9d-919e-fd7c291b900c)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

---

- **Fujitsu TX1330 M3**
    + Ubuntu 22.04 (default)
    + Single-Tenant Server 
    + CPU: Intel(R) Xeon(R) CPU E3-1220 v6 @ 3.00GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + Memory: 16 GB
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}}) & [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})

---

- **Palit GPU**
    + Ubuntu 22.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Desktop-PC
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
    + 48-Thread Multi-Tenant Server 
    + Ubuntu 22.04 (default)
    + SoftAWERE compatible 
    + CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: On
    + Turbo Boost: Off
    + Memory: 32 GB
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=72596fdf-b393-4cef-bb98-45679ae928f5)
    + Metrics Provider for Machine Power: [IPMI]({{< relref "metric-providers/psu-energy-ac-ipmi-machine" >}})


## Setting up your own measurement cluster

Please refer to the page [Installation of a Cluster]({{< relref "/docs/installation/installation-cluster" >}})
