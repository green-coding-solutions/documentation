---
title: "Carbon Intensity - Elephant - Machine"
description: "Documentation for CarbonIntensityElephantMachineProvider of the Green Metrics Tool"
date: 2026-05-11T08:49:15+00:00
weight: 221
---

### What it does

This provider fetches the carbon intensity (gCO2e/kWh) of the electricity grid from a self-hosted
or remotely hosted [Elephant](https://github.com/green-coding-solutions/elephant) service.
Elephant is a small HTTP service developed by us which aggregates carbon
intensity data from multiple upstream sources (e.g. Bundesnetzagentur, Electrcity Maps, ...) and exposes
them through a uniform REST interface. It also offers the ability to *simulate* arbitrary carbon
intensity curves so that the same workload can be re-evaluated under different grid scenarios.

This provider integrates Elephant into the Green Metrics Tool so that every run automatically
gets a carbon intensity time series for the configured region and data provider attached to it
without leaking any information to a third party.

### Classname

- `CarbonIntensityElephantMachineProvider`

### Metric Name

- `carbon_intensity_elephant_machine`

### Unit

- `gCO2e/kWh`

The provider stores integer values. The API returns floating point numbers which are rounded to
the nearest integer before being persisted.

### Prerequisites & Installation

The provider is a pure Python provider and does not need any binary to be compiled. It does
however require a reachable Elephant service. Elephant can be self-hosted via Docker; please
follow the instructions in the
[Elephant repository](https://github.com/green-coding-solutions/elephant) for the setup.

The provider must be configured in the `config.yml`:

```yml
measurement:
  metric-providers:
    common:
      carbon_intensity_elephant_machine:
        region: 'DE'
        sampling_rate: 99 # Remove if you don't want value padding
        provider: 'bundesnetzagentur'
        elephant:
          host: localhost
          port: 8085
          protocol: http
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `region` — The region identifier as understood by Elephant (e.g. `DE`, `FR`). The list of
  supported regions depends on which upstream providers your Elephant instance has configured.
- `provider` — The name of the carbon intensity data provider in Elephant to use (e.g.
  `bundesnetzagentur`, `entsoe`).
- `elephant.host` — Host name or IP of the Elephant service.
- `elephant.port` — Port the Elephant service listens on (default `8085`).
- `elephant.protocol` — `http` or `https`.
- `sampling_rate` — The sampling rate in milliseconds. As with the Electricity Maps provider this
  is used to *pad* the returned values so they align with the time series of the other providers
  rather than to query the API more often.

### Output

The provider does not produce a continuous Stdout stream. Once per run it queries the Elephant
service and writes the results directly to the database as a metric of the run.

Each row consists of:

- `time`: The timestamp of the data point in microseconds (UNIX epoch).
- `value`: The carbon intensity at that point in time in `gCO2e/kWh` as an integer.
- `detail_name`: The name of the Elephant carbon provider that produced the value
  (e.g. `bundesnetzagentur_de`). For carbon simulation runs this is the simulation UUID.

Any errors that occur while talking to the Elephant service are appended to the provider's stderr
buffer and can be inspected in the run details in the frontend.

### How it works

On `start_profiling` and `stop_profiling` the provider records UTC timestamps. When the metrics
are read at the end of the run it issues a single HTTP GET request to

```
<protocol>://<host>:<port>/carbon-intensity/history
```

with the configured `region`, the start/end times of the run, the `provider` filter, and
`update=true` so that Elephant re-fetches stale data from its upstream sources before responding.
The response is a list of `{time, carbon_intensity, provider}` entries which are sorted, rounded
to integer values and expanded to the configured `sampling_rate`.

If the response is empty — which typically happens for very short runs because upstream providers
update at intervals between 5 minutes and one hour — the provider falls back to:

```
<protocol>://<host>:<port>/carbon-intensity/current
```

(or `/carbon-intensity/current/primary` if no provider filter is configured) and uses the most
recent value as a single data point so that the run is never left without a carbon intensity.

### Health check

When the provider starts, it issues an HTTP GET against `/health` on the configured Elephant URL.
The service is expected to respond with a JSON body containing `{"status": "healthy"}`. If the
service is not reachable, returns a different status, or the response cannot be parsed, the
provider raises a `MetricProviderConfigurationError` and the run will not start.

### Carbon simulation

The Elephant provider is also used by the Green Metrics Tool to drive *carbon simulations*. When
running the runner with `--carbon-simulation <value>`:

- If `<value>` is a UUID, the simulation with that ID is used.
- If `<value>` is a list of carbon values, the runner first POSTs it to Elephant's `/simulation`
  endpoint to register a new simulation, and then uses the returned UUID for the run.
- If `<value>` is a single integer, that fixed intensity is applied to the whole run.

For simulation runs the provider sends `simulationId=<uuid>` as an additional query parameter to
Elephant which then returns the simulated carbon intensity curve instead of the real grid data.
Carbon simulations are useful to answer "what if?" questions such as how a workload would have
behaved on a grid with a different generation mix without re-running the workload.

See the `--carbon-simulation` argument of `runner.py` for more details.

### Caveats

- The provider requires that the Elephant service is reachable from the measurement machine. If
  Elephant is hosted on a different network, make sure that firewalls and routing allow the
  connection.
- The smallest temporal granularity supported by this provider depends on the upstream data
  provider configured in Elephant. Bundesnetzagentur for example updates roughly every 15 minutes.
- The fallback to the `current` endpoint will yield only a single data point. Long runs should
  therefore always observe enough upstream data to avoid the fallback path.
- Like all carbon intensity numbers in the Green Metrics Tool the values are stored as integers.
  Sub-`g/kWh` precision is lost;

### Troubleshooting

- *"Elephant base URL ... could not be reached"* — Check that `elephant.host`, `elephant.port`,
  and `elephant.protocol` are correct and that the Elephant service is running. Try
  `curl <protocol>://<host>:<port>/health` from the measurement machine.
- *"Elephant service health check failed"* — Elephant responded but did not report `healthy`.
  Check the Elephant logs for missing upstream credentials or unreachable upstream APIs.
- *"Please set the provider config option ..."* — You configured the provider without a
  `provider` entry and the run is not a carbon simulation. Either set `provider` in the
  `config.yml` or run with `--carbon-simulation`.
- Empty time series in the frontend — The run was too short and even the fallback endpoint did
  not return a value. Increase the run duration or use a simulation.
