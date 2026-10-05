---
title: "Network Connections - tcpdump - System"
description: "Documentation for NetworkConnectionsTcpdumpSystemProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 191
---

### What it does

This metric provider records the network traffic of the machine with [tcpdump](https://www.tcpdump.org/) while the measurement is running. After the run it summarizes the captured packets per IP address and per port or protocol. The summary is attached to the logs of the run.

This is a debug provider. It helps you to find out which hosts your application talks to and how much data it transfers. It does not produce a time series and its data is not part of any energy or carbon calculation. In the `config.yml.example` it is listed in the *DEBUG* group.

Unlike the [Network Connections Proxy provider]({{< relref "network-connections-proxy-container" >}}), it is not limited to HTTP and HTTPS. It captures the traffic that tcpdump sees on the machine, including traffic of processes that are not part of the measurement.

### Classname

- `NetworkConnectionsTcpdumpSystemProvider`

### Metric Name

- `network_connections_tcpdump_system`

### Unit

The provider has no unit, as it does not produce numeric measurement values.

### Platform

The provider is listed in the `common` section of the `config.yml.example`. It needs `bash` and `tcpdump` on the measurement machine.

### Prerequisites & Installation

- `tcpdump` must be installed and available in the `PATH`. The install script does not install it for you.
- GMT starts tcpdump with the permissions of the user that runs GMT. It does not use `sudo`. This user must therefore be allowed to capture network packets.

The provider is configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    common:
      network_connections_tcpdump_system:
        split_ports: True
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `split_ports`: Optional, defaults to `True`. If `True`, the statistics for each IP address are split by `<port>/<protocol>`. If `False`, they are only split by protocol.

The provider does not take a `sampling_rate`, as it records every packet.

The wrapper script `tcpdump.sh` accepts the following argument:

- `-c`: check mode. Tries to capture a single packet and exits.

Without arguments the script runs:

```bash
tcpdump -tt --micro -n -v
```

This prints UNIX timestamps with microsecond precision (`-tt --micro`), skips the resolution of host names (`-n`) and prints verbose packet details (`-v`). No interface is given, so tcpdump listens on its default interface.

### Output

The raw output of tcpdump is written to a log file during the run. After the run the provider parses this file and creates a text summary of the following form:

```txt
IP: 192.168.1.10 (as sender or receiver. aggregated)
  Total transmitted data: 48213 bytes
  Ports:
    443/TCP: 52 packets, 48213 bytes
```

Every packet is counted twice, once for its source IP and once for its destination IP.

The summary is stored in the logs of the run under the `[SYSTEM]` container with the log type `network_stats`. In the frontend you find it in the logs of the run, with the tooltip *"Network connection statistics from tcpdump"*. The provider does not write anything into the measurement values of the run.

### How it works

GMT starts this provider together with the container based providers. This happens right after the `[BOOT]` phase. The capture thus covers the `[IDLE]`, `[RUNTIME]` and `[REMOVE]` phases. Traffic during the `[INSTALLATION]` and `[BOOT]` phases is not captured.

Shortly after the start GMT checks the Stderr of the provider. The two informational lines that tcpdump always prints at startup (*"tcpdump: listening on ..."* and *"tcpdump: data link type ..."*) are removed. Any other Stderr output fails the run.

When parsing the output, the provider handles IPv4 and IPv6 packets, LLDP frames and Ethernet frames with an unknown ethertype. ARP packets and layer 2 control frames such as STP and CDP are ignored. Lines that the parser does not understand are logged as an error, but do not fail the run.

### Disabling the provider per user

The provider can be switched off for single users, even if it is configured on the machine. Open the *Settings* page in the dashboard and select `network_connections_tcpdump_system` under *Disable providers*. The setting is stored as `measurement.disabled_metric_providers` with the snake case provider name. Only `network_connections_tcpdump_system` and `network_connections_proxy_container` are accepted there.

The setting applies to jobs that are run through the job queue, for example on a [measurement cluster]({{< relref "/docs/measuring/measurement-cluster" >}}). When you call `runner.py` directly, the setting is not applied. Remove the provider from the `config.yml` instead.

### Troubleshooting

- *"network_connections_tcpdump_system provider could not be started"*: The check mode failed. It runs `tcpdump` for at most 3 seconds and waits for a single packet. The check fails if tcpdump cannot capture, for example because of missing permissions. It also fails if no packet arrives on the default interface within these 3 seconds.
