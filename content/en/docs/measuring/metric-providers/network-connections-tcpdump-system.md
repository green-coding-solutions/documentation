---
title: "Network Connections - tcpdump - system"
description: "Documentation of NetworkConnectionsTcpdumpSystemProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 191
---

### What it does

This metric provider captures all network traffic on the machine with `tcpdump` and aggregates it
per IP address and port. It answers the question "which hosts did this run talk to, and how much
data was exchanged".

Unlike the [Network Connections Proxy Container provider]({{< relref "network-connections-proxy-container" >}}),
which only sees external **http** and **https** connections routed through a proxy, this provider
sees every packet on the wire, including inter-container traffic and non-HTTP protocols. It does
not resolve hostnames.

This is a **debugging** provider. It is listed under the `DEBUG` section of the `config.yml` and is
disabled by default.

### Classname

- `NetworkConnectionsTcpdumpSystemProvider`

### Metric Name

- `network_connections_tcpdump_system`

### Unit

The provider has **no unit** and produces no numeric time series. See [Output](#output).

### Configuration

The provider lives in the `common` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    common:
      network_connections_tcpdump_system:
        split_ports: True
```

Config keys:

- `split_ports` — defaults to `True`. When `True`, traffic is bucketed per `<port>/<protocol>`
  (e.g. `443/TCP`). When `False`, ports are ignored and traffic is bucketed per protocol only
  (e.g. `TCP`). Turn this off when you care about the volume per host rather than per service, or
  when a workload uses many ephemeral ports and the per-port breakdown becomes unreadable.

Note that this provider takes **no `sampling_rate`**. It captures every packet rather than sampling
at an interval, so no `-i` argument is passed to it.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

The provider executes the shell script `tcpdump.sh`, which takes:

- args
    - `-c`: check/test mode — tries to capture a single packet with a 3 second timeout and exits

In measurement mode the script runs:

```bash
tcpdump -tt --micro -n -v
```

Where `-tt` prints an unformatted Unix timestamp, `--micro` gives microsecond resolution, `-n`
disables name resolution and `-v` produces the verbose output the parser expects.

### Output

This provider does **not** write to the `measurement_values` table like the other providers. The
raw `tcpdump` output is parsed at the end of the run and the aggregated result is stored as a
`NETWORK_STATS` log entry on the run itself, where it can be inspected in the run details in the
frontend.

The stored text is formatted per IP address:

```text
IP: 93.184.216.34 (as sender or receiver. aggregated)
  Total transmitted data: 15320 bytes
  Ports:
    443/TCP: 24 packets, 15320 bytes
```

Every packet is counted for **both** its source and its destination IP, which is why the report
says *as sender or receiver. aggregated*.

Empty output is explicitly allowed for this provider — a run with no captured traffic is not an
error.

### How it works

On start, `tcpdump.sh` is launched and its output is written to the provider's log file. When the
run is over, the log is parsed line by line in Python.

The parser recognises several `tcpdump` line shapes, including IPv4 and IPv6 addresses with and
without ports, payload-length lines, `ethertype Unknown` frames and LLDP frames. Addresses are
validated with Python's `ipaddress` module. The following are deliberately ignored:

- ARP traffic
- Layer-2 control frames (STP, CDP)
- MAC-address-only frames
- Indented detail lines belonging to the preceding packet
- `tcpdump`'s own startup banners on Stdout and Stderr

A line that matches none of the known shapes is **logged as an error and skipped** rather than
aborting the run. This was a deliberate change: `tcpdump` occasionally emits shapes that have not
been seen before, and losing the whole run over one unparsed line is worse than losing one packet.

Because this provider watches the containers rather than the machine's energy behaviour, the
scenario runner starts it together with the container providers, not with the system providers.

### Caveats

- `tcpdump` requires elevated privileges to put the interface into capture mode. If it cannot be
  started, the system check fails with a hint about missing sudo permissions.
- The provider captures **all** traffic on the machine, not just the traffic of your containers.
  Anything else running on the measurement host appears in the report.
- Host filtering is **not implemented**. `generate_stats_string()` raises `NotImplementedError` if
  `filter_host` is requested, because the `netifaces` library it relied on has been abandoned and
  no replacement is in place yet. There is therefore no way to exclude the measurement machine's
  own addresses from the report.
- Packet capture adds overhead and writes a large log file on a busy network. This is why the
  provider is filed under debugging and is off by default.
- Since every packet is counted for both endpoints, summing "Total transmitted data" across all
  IPs counts each byte twice.

### Troubleshooting

- **`tcpdump could not be started. Missing sudo permissions?`** — the check mode could not capture
  a packet. Verify that `tcpdump` is installed and that it may run without a password prompt.
- **Empty report** — no traffic was captured during the run. On a quiet interface this is normal
  and is not treated as an error.
- **`Unmatched tcpdump line` entries in the system logs** — the parser encountered a line shape it
  does not know. The packet is skipped; the rest of the report is still valid. Please report the
  line so the parser can be extended.
