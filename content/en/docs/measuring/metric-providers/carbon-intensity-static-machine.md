---
title: "Carbon Intensity - Static - Machine"
description: "Documentation for CarbonIntensityStaticMachineProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 222
---

### What it does

This provider attaches a fixed grid carbon intensity value in gCO2e/kWh to every run. You configure the value once in the `config.yml` and GMT uses it to turn the measured energy into operational carbon emissions.

The provider replaces the former static SCI `I` value that used to live under the `sci` key of the `config.yml`. For background on grid carbon intensity and on when to prefer a static value over live grid data, see [Grid Carbon Intensity →]({{< relref "/docs/measuring/carbon/grid-carbon-intensity" >}}).

The provider is enabled by default in the `config.yml.example` with a value of `445` gCO2e/kWh. This is the global average for 2024 as reported by the [IEA](https://www.iea.org/reports/electricity-2025/emissions).

### Classname

- `CarbonIntensityStaticMachineProvider`

### Metric Name

- `carbon_intensity_static_machine`

### Unit

- `gCO2e/kWh`

The provider stores integer values. The configured value is rounded to the nearest integer before it is persisted.

### Platform

The provider lives in the `common` section of the `config.yml`. GMT merges this section into the provider list on every platform, so the provider is active on Linux, macOS and Windows alike.

### Prerequisites & Installation

The provider is a pure Python provider. It needs no binary, no special hardware and no network access.

The provider is configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    common:
      carbon_intensity_static_machine:
        # Static carbon intensity in gCO2e/kWh. Replaces the former SCI 'I' value.
        # The number 445 is global 2024 (https://www.iea.org/reports/electricity-2025/emissions)
        value: 445
        sampling_rate: 99 # Remove if you don't want value padding
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `value`: The grid carbon intensity in gCO2e/kWh. This parameter is required. If it is empty or not a number, GMT refuses to start the provider with a configuration error.
- `sampling_rate`: Optional, in milliseconds. The provider does not sample anything. The value is only used to *pad* the constant carbon intensity onto a time grid with the same resolution as the other metric providers, so that the time series can be joined cleanly. If you leave it out, the provider stores only two data points, one at the start and one at the end of the measurement.

### Output

The provider does not start an external process and produces no Stdout stream. When GMT reads the metrics at the end of the run, the provider generates the data points in memory. They are then inserted into the database as a regular metric of the run.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The configured carbon intensity in gCO2e/kWh as an integer.
- `detail_name`: Always `static`.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. When the metrics are read, it creates one data point at each of these two timestamps, both carrying the configured value. If a `sampling_rate` is set, the two points are expanded to a grid with that step width.

The system check of this provider always passes, as there is no external system to verify.

GMT then uses the carbon intensity in the following places:

- For every energy metric of the run that is reported in `uJ`, GMT derives a matching carbon metric in `ugCO2e`. It multiplies each energy value with the carbon intensity that was in effect at that point in time. For example `psu_energy_ac_mcp_machine` gets the companion metric `psu_carbon_ac_mcp_machine`.
- In the phase statistics the carbon intensity is stored as a mean value per phase. GMT treats it as a step function, which means a value stays in effect until the next one.
- The phase mean is used to compute the carbon of the network transfer formula (`network_carbon_formula_global`).
- The derived carbon metrics of machine level energy providers (metric names ending in `_machine`) are summed up and feed into the [SCI]({{< relref "/docs/measuring/carbon/sci" >}}) calculation.

### Using it together with other carbon intensity providers

You should only have one carbon intensity provider active at a time. If more than one is configured, GMT uses the metric that comes first in alphabetical order for the SCI calculation and adds this warning to the run:

```txt
More than one carbon intensity provider is configured. Now using <metric name>
```

`carbon_intensity_static_machine` sorts after `carbon_intensity_electricity_maps_machine` and `carbon_intensity_elephant_machine`. So if one of the live providers is active as well, the static value is not used for the SCI. Comment out the static provider when you switch to the [Electricity Maps]({{< relref "carbon-intensity-electricitymaps-machine" >}}) or the [Elephant]({{< relref "carbon-intensity-elephant-machine" >}}) provider.

The [Carbon Intensity Level provider]({{< relref "carbon-intensitylevel-electricitymaps-machine" >}}) does not count here. It reports a categorical level and not a value in gCO2e/kWh, so GMT never uses it for carbon calculations.

### Caveats

- A static value does not reflect the actual grid mix at the time of the measurement. Set it to a typical or average value for the location of your measurement machine.
- The value is stored with every run as a metric of that run. Changing it in the `config.yml` only affects runs made after the change.
