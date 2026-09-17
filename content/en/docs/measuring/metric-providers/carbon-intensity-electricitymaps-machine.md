---
title: "Carbon Intensity - Electricity Maps - Machine"
description: "Documentation for CarbonIntensityElectricitymapsMachineProvider of the Green Metrics Tool"
date: 2026-05-11T08:49:15+00:00
weight: 220
---

### What it does

This provider fetches the carbon intensity (gCO2e/kWh) of the electricity grid for a configured
region from the [Electricity Maps API](https://www.electricitymaps.com/) and aligns the returned
time series with the measurement window of the current run.

After every run the provider queries the *past-range* endpoint of the Electricity Maps API for the
zone configured in the `config.yml` and uses the carbon intensity data points that fall between
the `start_profiling` and `stop_profiling` timestamps. The values are then sampled into the
sampling rate granularity of the Green Metrics Tool and stored as a regular metric of the run.

If the run is too short to produce data points on the *past-range* endpoint (the API typically lags
by 5 minutes up to one hour, depending on the zone), the provider transparently falls back to the
*forecast* endpoint and uses the value closest to the measurement window. This means that even
short-running benchmarks have a carbon intensity value attached to them, although for very short
runs this value will be a forecast rather than a measured grid value.

### Classname

- `CarbonIntensityElectricitymapsMachineProvider`

### Metric Name

- `carbon_intensity_electricity_maps_machine`

### Unit

- `gCO2e/kWh`

The provider stores integer values. The API returns floating point numbers which are rounded to
the nearest integer before being persisted.

### Prerequisites & Installation

The provider is a pure Python provider and does not need any binary to be compiled. It does however
require network access from the measurement machine to `api.electricitymaps.com` and a valid
Electricity Maps API token.

You can obtain a free token (subject to fair-use limits) at
[https://api-portal.electricitymaps.com/](https://api-portal.electricitymaps.com/).

Please note: The free token is for non-commercial use only. If you want to use Electricity Maps
data in a commercial context you need to acquire a commercial license from Electricity Maps.

The provider must be configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    common:
      carbon_intensity_electricitymaps_machine:
        region: 'DE'
        token: 'XXXX'
        sampling_rate: 99 # Remove if you don't want value padding
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `region` — The Electricity Maps zone identifier (e.g. `DE`, `FR`, `US-CAL-CISO`). A list of
  available zones can be found in the [Electricity Maps API documentation](https://portal.electricitymaps.com/docs/getting-started#geographical-coverage).
- `token` — A valid Electricity Maps API token. Without a token the provider will refuse to start.
- `sampling_rate` — The sampling rate in milliseconds. This value is not used to call the API more
  frequently (the API is only called once per run) but to *pad* the returned values to the same
  resolution as the other metric providers so that the time series can be joined cleanly.

### Output

The provider does not produce a continuous Stdout stream like the C-based providers. Instead, the
data is fetched once per run from the Electricity Maps API and inserted directly into the database
as a metric of the run.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The carbon intensity at that point in time in `gCO2e/kWh` as an integer.
- `detail_name`: Always `electricity_maps` to indicate the data source.

The provider does not have a stderr buffer. Any error that occurs while talking to the API is
raised as an exception and aborts the run.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. When the metrics are
read at the end of the run it issues a single HTTP GET request to

```
https://api.electricitymaps.com/v4/carbon-intensity/past-range
```

with the configured zone, the start/end times of the run, and a temporal granularity of 5 minutes.
The response is a list of `{datetime, carbonIntensity}` entries which are filtered to the
measurement window, sorted ascending in time, rounded to integer values and finally expanded to the
configured `sampling_rate` so that the values align with the other providers' time series.

If the response is empty (typically because the run finished before the grid data caught up) the
provider falls back to the forecast endpoint

```
https://api.electricitymaps.com/v4/carbon-intensity/forecast
```

and picks the forecast value closest to the measurement window.

### Health check

When the provider starts, it issues a small `past-range` request for the last hour to confirm that
the configured zone is valid and that the API token is accepted. If the API returns `401` or `403`
the provider raises a `MetricProviderConfigurationError` with a hint that the token is incorrect.
If the API endpoint cannot be reached at all (DNS/network issues) the same error is raised with the
underlying exception.

### Caveats

- The provider requires network access during the run. If the measurement machine is air-gapped
  this provider will not work. Use the [Elephant carbon intensity provider]({{< relref "carbon-intensity-elephant-machine" >}})
  in that case, which can be hosted locally.
- The free Electricity Maps token is rate-limited. If you run a large number of measurements you
  may hit the limit, in which case the provider raises an error and the run fails.
- The smallest temporal granularity supported by this provider is 5 minutes. Short-running
  benchmarks (under a few minutes) will usually have only a single carbon intensity value
  associated with them.
- The carbon intensity returned by Electricity Maps is a grid average, not a marginal value. If
  you need marginal values you have to compute them yourself based on the Electricity Maps
  *power-breakdown* endpoint, which is not supported by this provider.

### Troubleshooting

- *"Electricity Maps token was rejected"* — Check that the `token`
  field on the provider is set to a valid token from
  [https://api-portal.electricitymaps.com/](https://api-portal.electricitymaps.com/).
- *"Electricity Maps base URL ... could not be reached"* — Check the network connectivity of the
  measurement machine and that no firewall blocks `api.electricitymaps.com`.
- Empty time series in the frontend — The run was likely too short and even the forecast endpoint
  did not return a usable value. Increase the run duration or use the Elephant provider.
