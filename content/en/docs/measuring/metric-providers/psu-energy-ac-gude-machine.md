---
title: "PSU Energy AC - Gude - machine"
description: "Documentation of PsuEnergyAcGudeMachineProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 209
---

### What it does

This metric provider reads the AC power draw of the whole machine from a
[Gude](https://gude-systems.com/) networked power meter over HTTP and converts it to energy.

The provider was originally built for the
[Gude Expert Power Control 1202](https://gude-systems.com/en/products/expert-power-control-1202/),
the same power meter used by the [Blauer Engel](https://eco.kde.org/blog/2022-05-30-sprint-lab-setup/)
team for their measurements. It is a slimmed-down version of the vendor's
[check_gude.py](https://github.com/gudesystems/check_gude.py).

Please note: This metric provider is **no longer officially maintained** by us. It remains in the
code base for backwards compatibility.

### Classname

- `PsuEnergyAcGudeMachineProvider`

### Metric Name

- `psu_energy_ac_gude_machine`

### Unit

- `uJ`

### Configuration

The provider lives in the `linux` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    linux:
      psu_energy_ac_gude_machine:
        sampling_rate: 99
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to the script as `-i`.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

Rather than a compiled binary this provider runs the Python script `check_gude_modified.py`:

- args
    - `-i`: interval in milliseconds. The script exits with the usage text if it is not supplied.

```bash
./check_gude_modified.py -i 100
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds, taken *after* the HTTP request completed
- `READING`: The energy consumed over the elapsed interval in *uJ*

Any errors are printed to Stderr.

### How it works

The script loops for the lifetime of the run. On each iteration it:

1. Records a timestamp, sleeps for `sampling_rate` milliseconds.
2. Issues an HTTP GET to the power meter's `status.json` endpoint with the `components=0x4000`
   parameter, which asks the device for simple sensor values only.
3. Records a second timestamp and derives the effective elapsed time.
4. Reads the power value out of the JSON response and multiplies it by the elapsed time in
   microseconds, yielding microjoules.

Because the energy is derived from the *effective* elapsed time rather than the requested sleep
time, network latency to the power meter does not silently inflate or deflate the energy total.

The power value is taken from a fixed position in the response document:
`sensor_values[0].values[0][4].v`.

### Caveats

- **The address of the power meter is hardcoded** in `check_gude_modified.py` as
  `http://192.168.178.32/status.json`. There is no config option for it. You have to edit the
  script to point it at your device.
- TLS verification is disabled and no authentication is sent with the request. The provider expects
  the power meter to be reachable unauthenticated on a trusted local network.
- The provider does not ship a `metric-provider-binary`, but it also does not override the default
  system check, which expects one. Enabling this provider on a system where the check runs will
  therefore fail to find a binary to check. You can bypass the checks with `--dev-no-system-checks`.
- The position of the power value in the JSON is fixed. A device with a different sensor layout, or
  a firmware that reorders the document, will yield wrong values rather than an error.
- The reading measures the **whole machine** at the wall socket. It includes every other component
  and any other workload on the machine, not just the measured containers.
- The HTTP request has a 15 second timeout. At small sampling rates a slow device will therefore
  stall the loop rather than skip a sample.

### Troubleshooting

- **`Please supply -i to set sampling_rate in milliseconds`** — the script was called without `-i`.
- **Connection errors / timeouts** — the power meter is not reachable at the hardcoded IP. Verify
  that the device answers at `http://192.168.178.32/status.json` from the measurement machine, or
  edit the URL in `check_gude_modified.py`.
- **`IndexError` / `KeyError` on `sensor_values`** — the device returned a document that does not
  have the expected sensor layout.
- The script needs the `requests` package to be importable in the environment the tool runs in.
