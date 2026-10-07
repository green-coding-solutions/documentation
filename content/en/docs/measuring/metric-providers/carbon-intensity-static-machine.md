---
title: "Carbon Intensity - Static - Machine"
description: "Documentation of CarbonIntensityStaticMachineProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 222
---

### What it does

This provider supplies a **fixed** grid carbon intensity value that you configure yourself. It does
not talk to any external service.

It is the direct replacement for the former static `sci.I` value in the `config.yml`. Carbon
intensity is no longer an SCI configuration value but a metric provider, so that you can choose
between a static value and live grid data per run. See
[Grid Carbon Intensity →]({{< relref "/docs/measuring/carbon/grid-carbon-intensity" >}}) for the
background of that migration and for the alternatives.

Use this provider when you want **reproducible measurements** and **fair comparisons**: every run
on the machine uses the same baseline, so a change in reported carbon can only come from a change
in the software, never from a change in the grid.

This is the **only carbon intensity provider that is enabled by default** in
`config.yml.example`, with a value of `445` gCO2e/kWh — the global average for 2024 according to
the [IEA](https://www.iea.org/reports/electricity-2025/emissions).

### Classname

- `CarbonIntensityStaticMachineProvider`

### Metric Name

- `carbon_intensity_static_machine`

### Unit

- `gCO2e/kWh`

The provider stores integer values. The configured value may be a float and is rounded to the
nearest integer before being persisted.

### Configuration

The provider lives in the `common` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    common:
      carbon_intensity_static_machine:
        # Static carbon intensity in gCO2e/kWh. Replaces the former SCI 'I' value.
        value: 445
        sampling_rate: 99
```

Config keys:

- `value` — **required**. The static carbon intensity in gCO2e/kWh. Must be numeric. If it is
  missing the provider raises a `MetricProviderConfigurationError` at startup, and so does a value
  that cannot be parsed as a number.
- `sampling_rate` — optional, in milliseconds. Defaults to `-1`. This does not make the provider
  measure anything more often — there is nothing to poll — but it *pads* the value to the same
  resolution as the other providers so the time series can be joined cleanly. Remove it if you do
  not want value padding.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

This is a pure Python provider. There is no binary and no command line interface.

### Output

The provider does not produce a continuous Stdout stream like the C-based providers. The value is
generated in memory at the end of the run and inserted directly into the database as a metric of
the run. Its stderr is always empty.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The configured carbon intensity as an integer.
- `detail_name`: Always `static` to indicate the data source.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. Nothing runs in
between — there is no subprocess and no polling.

When the metrics are read at the end of the run, it emits two records with the configured value:
one at the start timestamp and one at the end timestamp. If the two timestamps are identical
(a run so short that both fall in the same microsecond) the end timestamp is nudged forward by one
microsecond so the two rows remain distinct.

Those two records are then expanded to the configured `sampling_rate`, producing a value on every
sampling grid point between start and end. If `sampling_rate` is `-1` or otherwise not positive,
the expansion is skipped and only the two boundary records are stored.

### Health check

The provider overrides the system check to always succeed. There is no external system to verify
for a statically configured value, and no check for a parallel instance is performed.

### Caveats

- This is a **configured constant, not a measurement**. It says nothing about the actual carbon
  intensity of the grid during the run. That is the point of the provider — reproducibility — but
  it means the reported operational carbon is only as meaningful as the value you chose.
- The default of `445` is a global average. If you want a value representative of your own grid,
  set it to your region's figure, or use one of the live providers such as
  [Electricity Maps]({{< relref "carbon-intensity-electricitymaps-machine" >}}) or
  [Elephant]({{< relref "carbon-intensity-elephant-machine" >}}).
- The value is rounded to an integer. Sub-1 gCO2e/kWh precision is not preserved.
- Do not enable more than one carbon intensity provider at a time unless you deliberately want
  multiple, differently-sourced carbon intensity series on the same run.

### Troubleshooting

- **`Please set the value config option for CarbonIntensityStaticMachineProvider in the config.yml`** —
  the provider is enabled but has no `value` key.
- **`value for CarbonIntensityStaticMachineProvider must be numeric (got ...)`** — the `value` key
  is not a number. Quoted strings such as `'445 gCO2e/kWh'` will trigger this.
- **`... provider did not record start/end times`** — the provider was read without a complete
  start/stop cycle. This indicates an aborted run rather than a configuration problem.
