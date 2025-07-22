---
title: "Network IO - procfs - container"
description: "Documentation for NetworkIoProcfsContainerProvider of the Green Metrics Tool"
lead: ""
date: 2023-08-04T08:49:15+00:00
weight: 205
---

### What it does

It reads the total amount of sent and received bytes from the network interfaces
of a container by entering the container's network namespace and
reading the information from `/proc/net/dev`.

### Classname

- `NetworkIoProcfsContainerProvider`

### Metric Name

- `network_io_procfs_container`

### Input Parameters

- args
    - `-s`: container-ids seperated by commas
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of
the data is as follows:

`TIMESTAMP READING CONTAINER-ID`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The amount of bytes sent and received during the time interval
- `CONTAINER-ID`: The container ID that this reading is for

Any errors are printed to Stderr.

### How it works

The provider enters the network namespace of each specified container via the
`setns` system call on the file `/proc/<PROCESS-ID>/ns/net`.
After entering the namespace the provider reads from `/proc/net/dev` and:
- parses the output
- skips all `lo` interfaces
- sums up the `r_bytes` and `t_bytes` of all other interfaces
- does NOT count dropped packets (we assume since most of the traffic is internal,
  that a dropped received packet shows up in another interface as sent anyway and
  a dropped sent packet does not attribute much to the energy consumption).

#### Attribution of network traffic

Currently all incoming and outgoing traffic is attributed to every container that
sends or receives it.

This may lead to unexpected results when you process the results, but is a design
decision.

In our [Green Metrics Dashboard](https://metrics.green-coding.io) we simply
accumulate all the network traffic of all containers and then
apply the [CO2-Formula](https://www.green-coding.io/co2-formulas) on top.

This however assumes that all traffic is with external services. If your
containers are however only
communicating with each other and are in production all on one machine, this
number will not
represent the real CO2 emissions, but is rather greatly overstating them.

This design decision was made because we cannot know during benchmarking how your
containers
would be orchestrated in production.
They can very well be all on one machine (which would have zero network emissions),
but they also could be distributed in an internal network
of a datacenter (which would have only marginal network CO2 emissions) or really
 distributed globally (which would then have the maximum of CO2 emissions).

Since our reporters should give you an optimization baseline we opted for the
worst-case scenario to report in our Dashboard.

When processing the metrics you own you may well use a different approach given
your knowledge of the network topology.
