---
title: "Network Carbon Intensity"
description: "How to estimate the carbon emissions of network transfer"
lead: "How to estimate the carbon emissions of network transfer"
date: 2025-07-18T08:49:15+00:00
weight: 530
toc: true
---

## What is Network Carbon Intensity?

Network carbon intensity measures the amount of carbon dioxide equivalent (CO2e) emissions generated per unit of data transferred across network infrastructure.
Since carbon emissions from network transfers cannot be directly measured, they must be estimated. Network carbon intensity is calculated using two key factors: the *Network Energy Intensity* (kWh/GB) and the *[Grid Carbon Intensity]({{< relref "grid-carbon-intensity" >}})* (g CO2e/kWh).

## Methodology

The network carbon intensity methodology and data sources used by the Green Metrics Tool are documented in detail on our [CO2 Formulas page](https://www.green-coding.io/CO2-formulas/#gigabytes-to-kwh).

## Relevance for the Green Metrics Tool

The Green Metrics Tool aims to provide not just the energy consumption of the device, but also an estimated value for the carbon emissions resulting from network data transfer. To achieve this, it uses the network carbon intensity approach.

Although network emissions are not officially part of the [Software Carbon Intensity (SCI)]({{< relref "sci" >}}) specification, the Green Metrics Tool includes them to offer a more complete view of your software’s carbon footprint.

### Measurement Approach

The Green Metrics Tool aggregates all network traffic from all containers and estimate CO2 emissions using the[CO2-Formula](https://www.green-coding.io/CO2-formulas). This approach assumes that all traffic is with external services. However, if your containers only communicate with each other and run on a single machine in production, the calculated emissions will significantly overstate the actual CO2 impact.

We made this design choice because, during benchmarking, we can't predict how your containers will be orchestrated in production. They might all run on one machine (resulting in zero network emissions), be distributed within a data center (with minimal emissions), or be spread globally (incurring the highest emissions). Since the Green Metrics Tool is meant to provide a baseline for optimization, we chose to report based on the worst-case scenario.

### Configuration

You can configure the network energy intensity as part of the [SCI]({{< relref "sci" >}}) configuration:

```yml
sci:
    N: 0.001875 # unit: kWh/GB
```

GMT calculates the network carbon intensity as:

```plain
network_data_transfer × N × I
```

The factor *I* is described in [Grid Carbon Intensity]({{< relref "grid-carbon-intensity" >}}).
