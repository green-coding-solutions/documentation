---
title: "Embodied Carbon"
description: "How to account for carbon emissions caused by the manufacturing of IT devices"
lead: "How to account for carbon emissions caused by the manufacturing of IT devices"
date: 2025-07-18T08:49:15+00:00
weight: 540
toc: true
---

## What is Embodied Carbon?

Embodied carbon refers to the greenhouse gas emissions generated throughout the entire lifecycle of IT hardware — from raw material extraction and manufacturing through transportation and disposal — as opposed to operational carbon from running the device. For many IT devices like smartphones, laptops, etc., embodied carbon represents 50-80% of total lifecycle emissions.

## Data Sources

Embodied carbon data comes from Life Cycle Assessment (LCA) studies that analyze the complete environmental impact of devices from cradle to grave. These studies quantify emissions from:

- Raw material extraction
- Manufacturing processes
- Transportation
- End-of-life disposal

You can get data from available databases or directly from the manufacturer.

Example sources:

- Databases:
  - [Boavizta Database](https://dataviz.boavizta.org/serversimpact) - Open database for IT emissions
  - [Resilio Database](https://resilio-solutions.com/en/services/database) - Commercial LCA database
- Manufacturer Data:
  - [Microsoft Surface TCO Calculator](https://tco.exploresurface.microsoft.com/sustainability/calculator)
  - [Dell R740 LCA Report](https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/Full_LCA_Dell_R740.pdf)

See also Green Software Foundation's webpage [Datasets](https://sci-guide.greensoftware.foundation/M/Datasets).

## Relevance for the Green Metrics Tool

Embodied carbon is a key component of the [Software Carbon Intensity (SCI)]({{< relref "sci" >}}) metric. The Green Metrics Tool incorporates embodied carbon to provide a complete picture of software's environmental impact by:

- **Proportional allocation**: Calculating how much embodied carbon should be attributed to each measurement run based on its duration and the device's expected lifetime
- **Hardware accountability**: Ensuring that the environmental cost of hardware is fairly distributed across all software running on it
- **Complete carbon accounting**: Adding embodied carbon to operational carbon to reflect the true environmental impact of software execution
- **Comparative analysis**: Enabling fair comparison between different software implementations by including the full lifecycle impact of the hardware they run on

The tool displays embodied carbon emissions for every measurement run, making it visible how hardware choices affect the overall carbon footprint of software.

### Configuration

You can configure the embodied carbon parameters as part of the [SCI]({{< relref "sci" >}}) configuration:

```yml
sci:
    EL: 4 # Expected device lifetime in years
    RS: 1 # Resource Share (1 = 100% of machine, 0.5 = 50% virtualized)
    TE: 181000 # Total Embodied emissions in grams CO2e
```

GMT calculates the embodied carbon per measurement as:

```plain
(TE / EL) × (measurement_duration / year_duration) × RS
```
