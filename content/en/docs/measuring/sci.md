---
title: "SCI (Green Software Foundation)"
description: "How to measure the Green Software Foundation's SCI metric with the Green Metrics Tool"
lead: "How to measure the Green Software Foundation's SCI metric with the Green Metrics Tool"
date: 2023-08-04T08:49:15+00:00
weight: 842
toc: true
---

Since version v0.18 the Green Metrics Tool can measure the [Green Software Foundation's SCI](https://sci-guide.greensoftware.foundation/)

The metrics is essentially a Carbon per Unit of work metric and thus is very flexible in it's application. Supplemental
to the various metric providers that the Green Metrics Tool support this introduces not only the concept of total 
energy / carbon per usage_scenario, but also the concept of work done.

## Setup

The parts to derive the metric have to be defined in two places:
- The `usage_scenario.yml` (which sets the dimension *R_d*)
- The `config.yml`, which sets the machine specific parameters like *TE*, *RS* etc.

The actual ticks for the unit of work (*R*) are captured from the containers and processes STDOUT. This has to be activated by setting `log-stdout` and `read-sci-stdout` to **True**.

### Setup in usage_scenario

Please see an example how to configure in our [example applications repository for SCI apps](https://github.com/green-coding-berlin/example-applications/tree/main/green-software-foundation-sci).

A simple integration for an CLI based application might for instance look like this:

```
...
sci:
  R_d: calculated prime number
  # defined as the Carbon intensity per event that sysbench produces

flow:
  - name: Stress
    container: gcb-alpine-sysbench
    commands:
      - type: console
        note: Starting sysbench
        command: sysbench --cpu-max-prime=25000 --threads=1 --time=3 --test=cpu run --events=0 --rate=0 --debug=off | gawk '/total number of events:/{print "GMT_SCI_R="$NF}'
        shell: sh
        log-stdout: True
        log-stderr: True
        read-sci-stdout: True
```

As you can see we directly parse the output of a CLI command and the output the variable **GMT_SCI_R=...** to STDOUT.

If you have an API or similar the output might not happen on the CLI directly, but rather inside a node script or similar.

### Setup in config.yml

An [example configuration](https://github.com/green-coding-berlin/green-metrics-tool/blob/main/config.yml.example) for the `config.yml` is provided when the Green Metrics Tool is installed.
The values for the respective variables have to be either defined to best knowledge (like lifetime for instance) and / or
from official databases like:
- [https://dataviz.boavizta.org/manufacturerdata](https://dataviz.boavizta.org/manufacturerdata)
- [https://tco.exploresurface.com/sustainability/calculator](https://tco.exploresurface.com/sustainability/calculator)
- [https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/Full_LCA_Dell_R740.pdf](https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/Full_LCA_Dell_R740.pdf)

    

## Display

The metric will atm only be calculated for the **RUNTIME** phase and be shown in the Dashboard.
<img src="/img/sci_dashboard.webp">


If an SCI was configured also the parameters will be shown in the *Measurements* Tab.

<img src="/img/sci_measurement_tab.webp">

## Future work
Future work will include making the SCI an actual metric_provider and thus allowing to capture it in every phase, optionally with having different dimensions per phase even.

