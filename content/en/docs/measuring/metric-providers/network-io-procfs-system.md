---
title: "Network IO - procfs - system"
description: "Documentation for NetworkIoProcfsSystemProvider of the Green Metrics Tool"
date: 2025-07-22T17:50:00+00:00
weight: 202
---

### What it does

It reads the cumulative amount of bytes received and transmitted on each
network interface of the host by parsing `/proc/net/dev`. This allows
monitoring system-wide network usage independent of containers.

### Classname

- `NetworkIoProcfsSystemProvider`

### Metric Name

- `network_io_procfs_system`

### Input Parameters

- args
  - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of
 the data is as follows:

`TIMESTAMP RECEIVED_BYTES TRANSMITTED_BYTES INTERFACE`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `RECEIVED_BYTES`: Total bytes received by the interface since system boot
- `TRANSMITTED_BYTES`: Total bytes transmitted by the interface since system boot
- `INTERFACE`: Name of the network interface (for example, eth0)

Any errors are printed to Stderr.

### How it works

The provider reads the counters from `/proc/net/dev` for every network
interface. The values are sorted by interface and timestamp. Optionally, virtual
interfaces are filtered out so only physical network adapters are included.

For each interface, the difference between consecutive measurements is computed
internally to obtain the bytes transmitted during the sampling interval. The
sum of received and transmitted bytes forms the final value reported for the
interval.

System-wide network traffic is not attributed to specific containers. When
analyzing energy consumption based on these values, you may combine them with the
[Network Carbon Intensity →]({{< relref "../carbon/network-carbon-intensity" >}})
page for further guidance.
