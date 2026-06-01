---
title: "Grid Carbon Intensity"
description: "How to account for carbon emissions caused by grid-supplied power"
date: 2025-07-18T08:49:15+00:00
weight: 520
toc: true
---

Grid carbon intensity refers to the amount of carbon dioxide equivalent (CO₂e) emissions produced per kilowatt-hour (kWh) of electricity consumed from the power grid. This metric reflects the mix of energy sources (coal, gas, renewables, nuclear) used to generate electricity in a specific location and time.

We have described the conversion from energy to carbon emissions also on our website: [CO₂ Formulas - From kWh to CO₂e](https://www.green-coding.io/co2-formulas/#from-kwh-to-co2e)

## Data Sources

Grid carbon intensity data is available from government agencies, energy databases, and specialized services that track regional electricity carbon intensities.

Examples of available databases and services can be found on the Green Software Foundation's webpage (Grid Carbon Intensity: https://sci-guide.greensoftware.foundation/I/) and on the Green Software Landscape (https://landscape.bundesverband-green-software.de/?group=measurement&view-mode=grid&category=Databases) by the Bundesverband Green Software.

## Relevance for the Green Metrics Tool

The Green Metrics Tool uses grid carbon intensity to transform the measured energy consumption into operational carbon emissions based on local grid characteristics.

In the [Software Carbon Intensity (SCI)]({{< relref "sci" >}}) metric this value corresponds to the **I** parameter. Previously this was configured as a single static `sci.I` value in the `config.yml`. **This is no longer the case.** The carbon intensity is now supplied by a dedicated **carbon intensity metric provider**, which lets you choose between a static value and live grid data on a per-run basis.

## Carbon Intensity Providers

You select how the grid carbon intensity is determined by activating one of the carbon intensity providers in the `metric-providers` section of your `config.yml`. The following providers are available:

- **Static** (`CarbonIntensityStaticMachineProvider`) — Uses a fixed value you configure. This is the direct replacement for the old `sci.I` value and gives you **reproducible measurements** and **fair comparisons** (every run on the same machine uses the same baseline).
- **Electricity Maps** ([CarbonIntensityElectricitymapsMachineProvider]({{< relref "../metric-providers/carbon-intensity-electricitymaps-machine" >}})) — Fetches the real grid carbon intensity for your region and measurement window from the [Electricity Maps API](https://www.electricitymaps.com/).
- **Elephant** ([CarbonIntensityElephantMachineProvider]({{< relref "../metric-providers/carbon-intensity-elephant-machine" >}})) — Fetches the carbon intensity from a self-hosted or remotely hosted [Elephant](https://github.com/green-coding-solutions/elephant) service. Elephant is a small HTTP service developed by us that aggregates carbon intensity data from multiple upstream sources (e.g. Bundesnetzagentur, Electricity Maps) behind a uniform REST interface, without leaking any information to a third party. It can also *simulate* arbitrary carbon intensity curves so the same workload can be re-evaluated under different grid scenarios.

### Configuration

The static provider is the most common choice if you want a stable baseline. You configure it under `measurement.metric-providers.common` in your `config.yml`:

```yml
measurement:
  metric-providers:
    common:
      carbon_intensity_static_machine:
        # Static carbon intensity in gCO2e/kWh. Replaces the former SCI 'I' value.
        # The number 342 is for Germany 2025 (https://app.electricitymaps.com/zone/DE/all/yearly)
        value: 342
        sampling_rate: 99 # Remove if you don't want value padding
```

GMT calculates the operational carbon emissions by multiplying the measured energy consumption by the carbon intensity value reported by the active provider.

For the configuration details of the live providers see the dedicated provider pages linked above and the [Configuration →]({{< relref "../configuration" >}}) documentation.

### Static vs Dynamic Values

The **static** provider uses a single carbon intensity value rather than dynamic real-time data. This ensures **reproducible measurements** (results remain consistent across different measurement times) and **fair comparisons** (measurements on the same machine with the same configuration use the same baseline for carbon intensity). You should set the value to represent the typical or average value for your location.

The **Electricity Maps** and **Elephant** providers instead attach the *actual* grid carbon intensity for the time the measurement ran. This reflects reality more closely, but means that two otherwise identical runs can produce different carbon results depending on when they were executed. Choose the approach that matches your goal: a stable baseline for comparing software versions, or live data for reporting real-world impact.
