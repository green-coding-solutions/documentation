---
title: "Carbon Intensity Level - Electricity Maps - Machine"
description: "Documentation of CarbonIntensityLevelElectricitymapsMachineProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 223
---

### What it does

This provider fetches the current carbon intensity **level** of the electricity grid for a
configured region from the [Electricity Maps API](https://www.electricitymaps.com/) and stores it
as a metric of the run.

A level is a coarse classification (`low`, `moderate`, `high`) rather than a number in gCO2e/kWh.
If you want the actual carbon intensity of the grid, use the
[Carbon Intensity Electricity Maps provider]({{< relref "carbon-intensity-electricitymaps-machine" >}})
instead. This provider is useful when you want to know *whether the grid was clean or dirty* while
a run happened, for instance to schedule workloads, and not to compute an emissions figure.

### Classname

- `CarbonIntensityLevelElectricitymapsMachineProvider`

### Metric Name

- `carbon_intensity_level_electricitymaps_machine`

### Unit

- `level`

The API returns a string, which is mapped to an integer before being stored:

| API level  | Stored value |
|------------|--------------|
| `low`      | `1`          |
| `moderate` | `2`          |
| `high`     | `3`          |

The comparison is case-insensitive and whitespace is stripped. Any other level raises an error —
the provider does not guess.

### Prerequisites & Installation

The provider is a pure Python provider and does not need any binary to be compiled. It does however
require network access from the measurement machine to `api.electricitymaps.com` and a valid
Electricity Maps API token.

You can obtain a free token (subject to fair-use limits) at
[https://api-portal.electricitymaps.com/](https://api-portal.electricitymaps.com/).

Please note: The free token is for non-commercial use only. If you want to use Electricity Maps
data in a commercial context you need to acquire a commercial license from Electricity Maps.

### Configuration

The provider lives in the `common` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    common:
      carbon_intensity_level_electricitymaps_machine:
        region: 'DE'
        token: 'XXXX'
        sampling_rate: 99 # Remove if you don't want value padding
```

Config keys:

- `region` — **required**. The Electricity Maps zone identifier (e.g. `DE`, `FR`, `US-CAL-CISO`). A
  list of available zones can be found in the
  [Electricity Maps API documentation](https://portal.electricitymaps.com/docs/getting-started#geographical-coverage).
  Without a region the provider refuses to start.
- `token` — **required**. A valid Electricity Maps API token. Without a token the provider refuses
  to start.
- `sampling_rate` — optional, in milliseconds. Defaults to `-1`. This value is not used to call the
  API more frequently (the API is only called once per run) but to *pad* the returned value to the
  same resolution as the other metric providers so that the time series can be joined cleanly.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

This is a pure Python provider. There is no binary and no command line interface.

### Output

The provider does not produce a continuous Stdout stream like the C-based providers. The data is
fetched once per run from the Electricity Maps API and inserted directly into the database as a
metric of the run. Its stderr is always empty.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The level as an integer — `1`, `2` or `3` per the mapping above.
- `detail_name`: Always `electricity_maps` to indicate the data source.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. When the metrics are
read at the end of the run it issues a single HTTP GET request to

```text
https://api.electricitymaps.com/v4/carbon-intensity-level/latest
```

with the configured zone as the `zone` query parameter and the token in the `auth-token` header.
The `level` of the first entry of the response's `data` array is mapped to an integer.

That single value is then emitted twice — once at the start timestamp and once at the end timestamp
of the run — and expanded to the configured `sampling_rate`. If the two timestamps are identical
the end timestamp is nudged forward by one microsecond so the rows remain distinct. If
`sampling_rate` is `-1` or otherwise not positive, only the two boundary records are stored.

### Health check

When the provider starts, it issues a request against the same `latest` endpoint to confirm that
the configured zone is valid and that the API token is accepted. If the API returns `401` or `403`
the provider raises a `MetricProviderConfigurationError` with a hint that the token is incorrect.
If the endpoint cannot be reached at all (DNS/network issues) the same error is raised with the
underlying exception.

### Caveats

- The endpoint is `latest`, and it is only queried **after** the run has finished. The stored level
  is therefore the level at the time the metrics were read, not a level measured across the
  measurement window. For short runs these are effectively the same; for long runs the level may
  have changed during the run without that being visible.
- Both stored data points carry the same value. The series is flat by construction — this provider
  cannot show a level changing during a run.
- The value is an ordinal classification, not a physical quantity. `high` being `3` and `low` being
  `1` does not mean `high` is three times `low`. Do not average, sum or multiply these values.
- The provider requires network access during the run. If the measurement machine is air-gapped
  this provider will not work.
- The free Electricity Maps token is rate-limited. Note that this provider calls the API twice per
  run: once for the health check at startup and once when reading the metrics.
- Not every zone supports the carbon intensity level endpoint.

### Troubleshooting

- **`Please set the region config option ...`** / **`Please set the token config option ...`** — the
  provider is enabled but `region` or `token` is missing from the `config.yml`.
- **`Electricity Maps token was rejected. Please verify the token in the config.yml`** — the API
  answered `401` or `403`. Check the token at
  [https://api-portal.electricitymaps.com/](https://api-portal.electricitymaps.com/).
- **`Electricity Maps base URL ... could not be reached`** — check the network connectivity of the
  measurement machine and that no firewall blocks `api.electricitymaps.com`.
- **`Unknown carbon intensity level '<x>' from Electricity Maps`** — the API returned a level
  outside `low` / `moderate` / `high`.
- **`'data' array missing or empty`** / **`'level' key missing`** — the API responded, but not with
  a level for this zone. Verify that the zone identifier is correct and supported.
