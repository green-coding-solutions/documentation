---
title: "Host Resource Reservations"
description: "Reserving CPU and Memory to ensure GMT has sufficient compute power to orchestrate measurement"
date: 2025-12-15T16:20:15+10:00
weight: 1005
toc: false
---

GMT runs on the host system orchestrating containers. To have this process running smoothly.
GMT reserves a share of the available CPUs and the available Memory for the host system.

This ensures:

- Host does not OOM and measurement fails
- Host does not run into CPU scarcity and metric providers can safely capture all metrics

The setting is configured *per machine* in the `config.yml`

```yml
# config.yml
machine:
    ...  
  host_reserved_cpus: 1
  host_reserved_memory: 1073741824 # 1 GiB

```

#### Specifications

- `host_reserved_cpus` **[integer]** (Default 1): Value between 1 and CPU_MAX. CPU_MAX is the amount of available compute threads on the system.
- `host_reserved_memory` **[integer]** (Default 0): Value between 0 and MEMORY_MAX. MEMORY_MAX is the amount of available physical memory on the system.

## How to choose good values

### CPU

GMT will always reserve one core. So setting a value for `host_reserved_cpus` < 1 will fail. Typically GMT does not need more than one core, so you only should set this value to a higher value if your system has SMT / Hyper-Threading enabled or your host does a lot of other operations that should run undisturbed by the orchestrated containers.

For the former you should reserve as much cores as the SMT increases the core count. Typically SMT doubles a physical core to two hyper-cores. Thus you should set the reservation to two cores.

For the latter however though this indicates that the machine is a *noisy* measurement machine and we currently do not see any valid case for such a measurement machine ... write us an email if you have a one :)

### Memory

The default value for memory reservations in development is 0. This means Memory can be overcommited. In development this is fine as OOM situations can be resolved manually and it makes development quicker as containers have more memory to work with.

In a cluster setup the value should be derived as follows:

- Start the GMT `client.py`
- Wait 30 seconds until the python process has reserved all memory it needs
- Check `free -m` and read the current *used* memory.
- Add 300 MB and round up to the neareast half GiB (e.g 2.1 GiB (+300 MB) used memory rounds up 2.5 GiB)
