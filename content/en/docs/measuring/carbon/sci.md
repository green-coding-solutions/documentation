---
title: "Software Carbon Intensity (SCI)"
description: "How to measure the Green Software Foundation's SCI metric with the Green Metrics Tool"
date: 2023-08-04T08:49:15+00:00
weight: 550
toc: true
---

Green Metrics Tool supports custom metrics including the [Green Software Foundation's SCI](https://sci-guide.greensoftware.foundation/)

The metric is essentially a Carbon per Unit of work metric and thus is very flexible in it's application. Supplemental
to the various metric providers that the Green Metrics Tool support this introduces not only the concept of total
energy / carbon per usage_scenario, but also the concept of work done.

## Setup

The parts to derive the metric have to be defined in two places:

- The `usage_scenario.yml` (which sets the custom metric and its unit)
- The `config.yml`, which sets the machine specific parameters like *TE*, *RS* etc.

The actual ticks for the unit of work (*R*) are captured from the containers and processes STDOUT. This has to be activated by setting `log-stdout` (on by default).

### Setup in usage_scenario

Please see an example how to configure in our [example applications repository for SCI apps](https://github.com/green-coding-solutions/example-applications/tree/main/green-software-foundation-sci).

A simple integration for an CLI based application might for instance look like this:

```yaml

services:
  ubuntu:
    image: alpine
    setup-commands:
      - command: apk add sysbench coreutils gawk

custom_metric:
  calculated_prime_numbers:
    unit: CPN
    sci: True # optional. Will created additional metric gCO2e/CPN

flow:
  - name: Stress
    container: gcb-alpine-sysbench
    commands:
      - type: console
        note: Starting sysbench
        command: sysbench --cpu-max-prime=25000 --threads=1 --time=3 cpu run --debug=off | gawk '/total number of events:/ {cmd="date +%s%N"; cmd | getline ts; close(cmd); print ts " calculated_prime_numbers=" $NF}'
        shell: sh

```

As you can see we directly parse the output of a CLI command and the output the variable **calculated_prime_numbers=...** to STDOUT.

If you have an API or similar the output might not happen on the CLI directly, but rather inside a node script or similar.

### Setup in config.yml

An [example configuration](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/config.yml.example) for the `config.yml` is provided when the Green Metrics Tool is installed.
The values for the respective variables have to be either defined to best knowledge (like lifetime for instance) and / or
from official databases (like [Embodied Carbon →]({{< relref "embodied-carbon" >}}) and [Grid Carbon Intensity →]({{< relref "grid-carbon-intensity" >}})). See the respective documentation page for possible sources.

Example:

```yml
sci:
    EL: 4 # means 4 years of usage
    RS: 1 # means we use 1/1 = 100% of the machine. Bare metal. No virtualization
    TE: 181000 # Example value for a laptop taken from https://dataviz.boavizta.org/terminalimpact. Value is in g
    I: 334 # The number 334 that comes as default is for Germany from 2024. Value in gCO2e/kWh
```

## Display

The metric will is calculated per phase in which it occures and then aggregated in the RUNTIME as total.
<img src="/img/sci_dashboard.webp" alt="SCI (Software Carbon Intensity) dashboard showing carbon metrics">

If an SCI was configured and `sci: True` was set also the parameters will be shown in the *Measurements* Tab.

<img src="/img/sci_measurement_tab.webp" alt="SCI measurement tab showing detailed carbon intensity parameters">

## Formula

The [SCI formula](https://sci-guide.greensoftware.foundation/) is specified by the [Green Software Foundation](https://greensoftware.foundation/)

The components of the SCI are attributed by the GMT as follows:

- *E*: The energy of the total machine + the energy of the network.
    - A *PSU Energy* provider must be activated to populate this value with the machine energy like [PSU Energy XGBoost]({{< relref "../metric-providers/psu-energy-xgboost-machine" >}}), [PSU Energy MCP]({{< relref "../metric-providers/psu-energy-ac-mcp-machine" >}}), etc.
        - If none is activated machine energy will be excluded from the SCI.
    - A *Network IO* provider must be activated to populate this value with the network energy.
    - If none is activated network energy will be excluded from the SCI.
- *I:* Configured in the `config.yml`. Set the intensity of your used grid location
- *M:* Configured in the `config.yml`. Set the embodied carbon of your used machine

## Example applications

We provide quite some example applications that showcase how the SCI can be measured with the Green Metrics Tool for APIs, CLI tools etc.

[Example applications on GitHub](https://github.com/green-coding-solutions/example-applications/tree/main/green-software-foundation-sci)

[Example data with runs](https://metrics.green-coding.io/?uri=green-coding-solutions/example-applications&filename=green-software)

