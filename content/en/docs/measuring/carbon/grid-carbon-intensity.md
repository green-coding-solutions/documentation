---
title: "Grid Carbon Intensity"
description: "How to account for carbon emissions caused by grid-supplied power"
lead: "How to account for carbon emissions caused by grid-supplied power"
date: 2025-07-18T08:49:15+00:00
weight: 520
toc: true
---

## What is Grid Carbon Intensity?

Grid carbon intensity refers to the amount of carbon dioxide equivalent (CO₂e) emissions produced per kilowatt-hour (kWh) of electricity consumed from the power grid. This metric reflects the mix of energy sources (coal, gas, renewables, nuclear) used to generate electricity in a specific location and time.

We have described the conversion from energy to carbon emissions also on our website: [CO₂ Formulas - From kWh to CO₂e](https://www.green-coding.io/co2-formulas/#from-kwh-to-co2e)

## Data Sources

Grid carbon intensity data is available from government agencies, energy databases, and specialized services that track regional electricity carbon intensities.

Examples of available databases and services can be found on the Green Software Foundation's webpage (Grid Carbon Intensity: https://sci-guide.greensoftware.foundation/I/) and on the Green Software Landscape (https://landscape.bundesverband-green-software.de/?group=measurement&view-mode=grid&category=Databases) by the Bundesverband Green Software.

## Relevance for the Green Metrics Tool

Grid carbon intensity is the **I** parameter in the [Software Carbon Intensity (SCI)]({{< relref "sci" >}}) metric. The Green Metrics Tool uses grid carbon intensity to transform the measured energy consumption into carbon emissions based on local grid characteristics.

### Configuration

You can configure the grid carbon intensity as part of the [SCI]({{< relref "sci" >}}) configuration:

```yml
sci:
    I: 334 # Grid carbon intensity in gCO2e/kWh (example value for Germany 2024)
```

GMT calculates the operational carbon emissions by multiplying measured energy consumption by the grid carbon intensity value.

### Static vs Dynamic Values

The Green Metrics Tool uses **static** grid carbon intensity values rather than dynamic real-time data. This design choice ensures **reproducible measurements** (results remain consistent across different measurement times) and **fair comparisons** (measurements on the same machine with the same configuration use the same baseline for carbon intensity).

You should set the grid carbon intensity to represent the typical or average value for your location.
