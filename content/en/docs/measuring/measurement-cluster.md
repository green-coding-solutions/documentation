---
title: "Measurement Cluster"
description: "Setting up your measurement cluster - Our measurement cluster"
date: 2023-04-10T08:49:15+00:00
weight: 480
toc: true
---


## Our Measurement Cluster

Our Measurement Cluster runs on [NOP Linux changes →]({{< relref "nop-linux" >}}) and is the driver behind our [Hosted Service]({{< relref "measuring-service" >}}).

We have the following machines available for running measurements in our cluster. The **Machine ID**
is the number shown in the *ID* column of our
[Cluster Status page](https://metrics.green-coding.io/cluster-status.html) and is the identifier used
in the API and when a job is dispatched to a specific machine. The live availability, queue state and
detailed machine configuration of every machine can always be looked up there.

Machines marked **[PREMIUM]** are only available in our paid plans.

- **Machine ID 7 — CO2 Profiling (DVFS ON, TB ON, HT ON) - Esprimo P956**
    + Use Case: For profiling of a software to get a value for an off-the-shelf Ubuntu system with default configuration
    + Vendor: Fujitsu ESPRIMO P956
    + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Single-Tenant Server
    + CPU: Intel(R) Core(TM) i5-6500 CPU @ 3.20GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: N/A (not supported by this CPU, despite the *HT ON* in the machine name)
    + Turbo Boost: On
    + DVFS: On (`powersave` governor on the `intel_pstate` scaling driver)
    + C-States: All
    + Memory: 16 GB
    + RAPL Package Power Cap: 65 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=21c0bdb2-4013-423b-9939-8197ed5d5780)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
    + Special: **Blue Angel compatible** for Server applications

---

- **Machine ID 14 — CO2 Benchmarking 2.0 (DVFS OFF, TB OFF, HT OFF) - TX1330 M2 [PREMIUM]**
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
    + RAPL Package Power Cap: 25 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=85141bec-dc4a-4a47-8714-ac83d9f5a8a9)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
    + Special: **Blue Angel compatible** for Client-Server and Server applications
    + This machine replaces the former *CO2 Benchmarking* machine (Machine ID 5), see [Old Machines](#old-machines)

---

- **Machine ID 6 — Micro Benchmarking (DVFS OFF, TB OFF, HT OFF) - TX1330 M2 [PREMIUM]**
    + Use Case: For micro benchmarking of a software where configuration is tuned for reproducability. Reporters are set to 2 ms sampling_rate and limited to RAPL CPU / Memory as well as network I/O per cgroup
    + Vendor: Fujitsu TX1330 M2
    + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Single-Tenant Server
    + CPU: Intel(R) Xeon(R) CPU E3-1240L v5 @ 2.10GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 2.1 GHz)
    + C-States: C0-C1
    + Memory: 8 GB
    + RAPL Package Power Cap: 25 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=262f1df0-ac6c-4e74-8d08-9c13c0b25293)
    + Metrics Provider for Machine Power: None

---

- **Machine ID 12 — GUI Applications (DVFS OFF, TB OFF, HT OFF) - TX1330 M3 [PREMIUM]**
    + Use Case: For profiling of a GUI / Desktop software that uses X11 or Wayland window management systems
    + Vendor: Fujitsu TX1330 M3
    + OS: Ubuntu 24.04 (default) with Wayland Window manager
    + Type: Single-Tenant Server
    + CPU: Intel(R) Xeon(R) CPU E3-1220 v6 @ 3.00GHz
    + Cores: 4
    + Threads: 4
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 3.0 GHz)
    + C-States: All
    + Memory: 16 GB
    + RAPL Package Power Cap: 72 W
    + Host Reservation: 1 CPU core / 3 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=854c7722-3598-4b45-99db-f48433046ebe)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
    + Special: **Blue Angel compatible** for Client-Server, Server and Desktop applications
    + Special: External VGA Monitor connected to fully measure GPU Output overhead

---

- **Machine ID 15 — GUI High Performance (DVFS OFF, TB OFF, HT OFF) - TX1330 M4 [PREMIUM]**
    + Use Case: For GUI / Desktop software that needs more cores, a higher clock rate or more memory than the TX1330 M3
    + Vendor: Fujitsu TX1330 M4
    + OS: Ubuntu 24.04
    + Type: Single-Tenant Server
    + CPU: Intel(R) Xeon(R) E-2176G CPU @ 3.70GHz
    + Cores: 6
    + Threads: 6
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 3.7 GHz)
    + Memory: 32 GB
    + RAPL Package Power Cap: 75 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=a60c03ea-5017-4f64-ae13-15b469ebb2e7)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

---

- **Machine ID 11 — ML/AI Profiling (DVFS ON, TB ON, HT OFF) - GTX-1080 - [PREMIUM]**
    + Use Case: For GPU measurements and AI training measurements
    + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Desktop-PC (MSI MS-7B98)
    + CPU: Intel(R) Core(TM) i5-9600K CPU @ 3.70GHz
    + Cores: 6
    + Threads: 6
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 3.7 GHz)
    + Memory: 32 GB
    + RAPL Package Power Cap: 255 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + Graphics: GeForce GTX 1080 (NVIDIA GP104)
        * VRAM: 8 GB
        * Installed *NVIDIA* kernel driver packages: 535.309.01 and 580.173.02
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=2028c7b1-5065-4b74-a634-07f191e9fb5a)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})
    + Metrics Provider for GPU Energy: [NVIDIA NVML]({{< relref "metric-providers/gpu-energy-nvidia-nvml-component" >}})
    + Special: **Blue Angel compatible** for Server applications
    + Note: The machine name still carries the historic *DVFS ON, TB ON* suffix. The machine is currently configured with a locked 3.7 GHz clock rate and Turbo Boost disabled

---

- **Machine ID 13 — High Performance (DVFS OFF, TB OFF, HT OFF) - TX1330 M4 [PREMIUM]**
    + Use Case: For workloads with higher CPU count, higher clock frequency or high memory requirements
    + Vendor: Fujitsu TX1330 M4
    + OS: Ubuntu 24.04 ([NOP Linux](https://www.green-coding.io/blog/nop-linux/))
    + Type: Single-Tenant Server
    + CPU: Intel(R) Xeon(R) E-2176G CPU @ 3.70GHz
    + Cores: 6
    + Threads: 6
    + Hyper-Threading: Off
    + Turbo Boost: Off
    + DVFS: Off (Fixed to 3.7 GHz)
    + Memory: 64 GB
    + RAPL Package Power Cap: 75 W
    + Host Reservation: 1 CPU core / 2 GB memory
    + [Sample measurement with machine specs](https://metrics.green-coding.io/stats.html?id=1c410441-ebfc-4398-b1eb-ed47f4681d1b)
    + Metrics Provider for Machine Power: [MCP39F511N]({{< relref "metric-providers/psu-energy-ac-mcp-machine" >}})

### Old Machines

These machines are no longer available for measurements. They are listed here because older runs in our
database still reference them.

- **Machine ID 5 — CO2 Benchmarking (DVFS OFF, TB OFF, HT OFF) - TX1330 M2 - (Phased out Late 2025)**
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
    + Replaced by *CO2 Benchmarking 2.0* (Machine ID 14)

---

- **Machine ID 8 — Palit GPU - (Phased out Early 2025)**
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
    + Replaced by *ML/AI Profiling - GTX-1080* (Machine ID 11)

---

- **Machine ID 2 — Quanta Leopard-DDR3 - (Phased out Early 2025)**
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

---

- **Machine ID 3 — Fujitsu Esprimo P956 (Blue Angel compatible)**
    + Predecessor of the current *CO2 Profiling* machine (Machine ID 7)

---

- **Machine ID 10 — MacBook Pro 13" - 2015 (Premium)**
    + Use Case: macOS measurements

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
