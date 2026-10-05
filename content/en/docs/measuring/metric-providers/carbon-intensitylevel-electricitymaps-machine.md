---
title: "Carbon Intensity Level - Electricity Maps - Machine"
description: "Documentation for CarbonIntensitylevelElectricitymapsMachineProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 223
---

### What it does

This provider fetches the current carbon intensity *level* of the electricity grid for a configured zone from the [Electricity Maps API](https://www.electricitymaps.com/). Electricity Maps reports the level as `low`, `moderate` or `high`. The provider maps these to the numbers `1`, `2` and `3` and stores them as a metric of the run.

The level is a categorical value and not a carbon intensity in gCO2e/kWh. GMT therefore never uses it for any carbon calculation. If you need operational carbon emissions you still have to configure one of the carbon intensity providers, for example the [Static provider]({{< relref "carbon-intensity-static-machine" >}}) or the [Electricity Maps carbon intensity provider]({{< relref "carbon-intensity-electricitymaps-machine" >}}).

### Classname

- `CarbonIntensitylevelElectricitymapsMachineProvider`

### Metric Name

- `carbon_intensitylevel_electricitymaps_machine`

### Unit

- `level`

| Value | Electricity Maps level |
| ----- | ---------------------- |
| `1`   | `low`                  |
| `2`   | `moderate`             |
| `3`   | `high`                 |

### Platform

The provider lives in the `common` section of the `config.yml` and is thus available on Linux, macOS and Windows.

### Prerequisites & Installation

The provider is a pure Python provider and does not need any binary to be compiled. It does however require network access from the measurement machine to `api.electricitymaps.com` and a valid Electricity Maps API token.

You can get a token at [https://api-portal.electricitymaps.com/](https://api-portal.electricitymaps.com/). Please note that you need to pay for the Electricity Maps service if you want to use it commercially.

The provider must be configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    common:
      carbon_intensitylevel_electricitymaps_machine:
        region: 'DE'
        token: 'XXXX'
        sampling_rate: 99 # Remove if you don't want value padding
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `region`: The Electricity Maps zone identifier, for example `DE`. It is sent as the `zone` query parameter. This parameter is required.
- `token`: A valid Electricity Maps API token. It is sent in the `auth-token` HTTP header. This parameter is required. GMT redacts keys named `token` when it prints the provider configuration and when it stores the configuration with the run.
- `sampling_rate`: Optional, in milliseconds. This value is not used to call the API more often. The API is only called once per run. The value is only used to *pad* the level to the same time resolution as the other metric providers. If you leave it out, the provider stores only two data points, one at the start and one at the end of the measurement.

If `region` or `token` is empty, GMT refuses to start the provider with a configuration error.

### Output

The provider does not produce a continuous Stdout stream like the C based providers. The level is fetched once per run from the Electricity Maps API and inserted directly into the database as a metric of the run.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The level as an integer (`1`, `2` or `3`).
- `detail_name`: Always `electricity_maps`.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. When the metrics are read at the end of the run it issues a single HTTP GET request to

```txt
https://api.electricitymaps.com/v4/carbon-intensity-level/latest
```

with the configured zone. It takes the `level` field of the first entry in the `data` array of the response and maps it to `1`, `2` or `3`. The provider then writes this value at the start and at the end timestamp of the measurement. If a `sampling_rate` is set, the two points are expanded to a grid with that step width.

Since the provider only asks for the *latest* level, the stored value is the level at the time GMT reads the metrics, which is at the end of the run. The same value is applied to the whole measurement window. Changes of the level during a long run are not captured.

In the phase statistics GMT stores the mean, maximum and minimum level for every phase.

### Health check

When the provider starts, it sends the same request to the `latest` endpoint with a timeout of 10 seconds. This confirms that the zone is valid and that the API token is accepted.

- If the API returns `401` or `403`, the provider raises a `MetricProviderConfigurationError` saying that the token was rejected.
- If the API returns any other status than `200`, the provider raises a `MetricProviderConfigurationError` that contains the status code and the response body.
- If the API endpoint cannot be reached at all (DNS or network issues), the provider raises a `MetricProviderConfigurationError` with the underlying exception.

### Caveats

- The provider requires network access during the run. It does not work on air gapped measurement machines.
- The value is a single snapshot taken at the end of the run. It is not a time series of the grid state during the run.
- The level is informational only. GMT does not use it for the SCI or for any derived carbon metric.

### Troubleshooting

- *"Electricity Maps token was rejected. Please verify the token in the config.yml"*: Check that the `token` field of the provider is set to a valid token.
- *"Electricity Maps base URL ... could not be reached"*: Check the network connectivity of the measurement machine and that no firewall blocks `api.electricitymaps.com`.
- *"Unknown carbon intensity level '...' from Electricity Maps"*: The API returned a level other than `low`, `moderate` or `high`. The provider only knows these three levels.
- *"'data' array missing or empty in Electricity Maps response"*: The API did not return any level for the configured zone. Check that the `region` is a valid Electricity Maps zone.
