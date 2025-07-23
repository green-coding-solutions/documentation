---
title: "Network IO - procfs - system"
description: "Documentation for NetworkIoProcfsSystemProvider of the Green Metrics Tool"
date: 2025-07-23T08:49:15+00:00
weight: 201
---

### What it does

It reads the total amount of bytes received and transmitted for each network interface on the host by parsing `/proc/net/dev`.

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

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP RECEIVED_BYTES TRANSMITTED_BYTES INTERFACE`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `RECEIVED_BYTES`: The cumulative number of bytes received since system boot
- `TRANSMITTED_BYTES`: The cumulative number of bytes transmitted since system boot
- `INTERFACE`: The name of the network interface

Any errors are printed to Stderr.

### How it works

The provider reads from `/proc/net/dev`, which contains network statistics for all interfaces on the system.

The provider:
- skips the header lines of the file
- parses each interface line
- ignores the `lo` loopback interface
- outputs the received and transmitted byte counters together with the interface name and a timestamp

The counters are cumulative since system boot. To compute interval values you can subtract consecutive readings.
