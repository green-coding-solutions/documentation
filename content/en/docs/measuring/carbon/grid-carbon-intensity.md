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

The Green Metrics Tool uses grid carbon intensity to transform the measured energy consumption into carbon emissions. It is also the **I** parameter in the [Software Carbon Intensity (SCI)]({{< relref "sci" >}}) metric.

## Configuration

The Green Metrics Tool supports both **static** and **dynamic** grid carbon intensity:

### Static Grid Carbon Intensity (Default)

By default, GMT uses a pre-configured **static** grid carbon intensity value. This approach ensures **reproducible measurements** (results remain consistent across different measurement times) and **fair comparisons** (measurements on the same machine with the same configuration use the same baseline for carbon intensity).

You can configure the grid carbon intensity as part of the [SCI]({{< relref "sci" >}}) configuration in `config.yml`:

```yml
sci:
    I: 334 # Grid carbon intensity in gCO2e/kWh (example value for Germany 2024)
```

You should set the grid carbon intensity to represent the typical or average value for your location.

#### Dynamic Grid Carbon Intensity (Advanced Feature)

GMT also supports **dynamic** grid carbon intensity that fetches real-time values during measurement runs. When enabled, this provides more accurate carbon calculations based on actual grid conditions at the time of measurement. But keep in mind, that your measurements are no longer fully reproducible as carbon values vary with grid conditions.

Dynamic carbon intensity is configured in the machine configuration file (`config.yml`):

```yml
dynamic_grid_carbon_intensity:
  location: 'DE'
  elephant:
    host: localhost
    port: 8000
    protocol: http
```

**Supported location codes:**

Only grid zone codes from [ElectricityMaps](https://portal.electricitymaps.com/developer-hub/api/getting-started#geographical-coverage) are supported (e.g., `DE`, `US-CAL-CISO`, `ES-IB-MA`, `GB`, `FR`).

Note: Depending on the configured API provider in Elephant, not all zones may be supported.

**Elephant Service:**

[Elephant](https://github.com/green-coding-solutions/elephant/) is a small service developed by Green Coding Solutions that acts as a sidecar-container. It retrieves carbon intensity data from an external service like Electricity Maps or others. It is not part of the default GMT deployment and must be set up separately if you want to use dynamic carbon intensity.

The repository includes a Dockerfile for easy deployment.

**How it works:**

When dynamic carbon intensity is enabled:

- The static `I` value in `config.yml` is ignored
- Carbon intensity is fetched from the Elephant service during measurement
- Time-series carbon data is mapped to actual energy consumption timing
- Requires access to a running Elephant service (configured within the `dynamic_grid_carbon_intensity` block)
