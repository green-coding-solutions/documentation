---
title: "PSU Energy - AC - Gude - Machine"
description: "Documentation for PsuEnergyAcGudeMachineProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 209
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
This metric provider is no longer officially maintained. It remains in GMT for backwards compatibility.
{{< /callout >}}

### What it does

This metric provider reads the power draw of the measured machine from a network attached Gude power meter and converts it to energy. It was initially meant for the same power meter that the [Blauer Engel](https://eco.kde.org/blog/2022-05-30-sprint-lab-setup/) team used, the [Gude Expert Power Control 1202](https://gude-systems.com/en/products/expert-power-control-1202/). Please find the technical specifications on the manufacturer's website.

The provider is a slimmed down version of [check_gude.py](https://github.com/gudesystems/check_gude.py).

### Classname

- `PsuEnergyAcGudeMachineProvider`

### Metric Name

- `psu_energy_ac_gude_machine`

### Unit

- `uJ`

### Platform

Linux. The provider is configured in the `linux` section of the `config.yml`, in the group of machine energy providers that need special lab equipment.

### Prerequisites & Installation

- The power meter must be reachable over HTTP at the IP address `192.168.178.32`. This address is hard coded in `check_gude_modified.py`. It cannot be changed in the `config.yml`. If your device uses another address, you have to edit the `url` in that script.
- The script `check_gude_modified.py` is started directly and uses `/usr/bin/env python3` as interpreter. This Python interpreter must have the `requests` package installed.

The provider is configured in the `config.yml`:

```yml
measurement:
  metric_providers:
    linux:
      psu_energy_ac_gude_machine:
        sampling_rate: 99
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `sampling_rate`: Interval between two measurements in milliseconds. This is the only configuration option.

The script accepts the following argument:

- `-i`: interval in milliseconds. This argument is mandatory.

```bash
./check_gude_modified.py -i 99
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The energy used since the start of the current loop iteration, in micro Joules

Any errors are printed to Stderr.

### How it works

The script runs in a loop. In every iteration it:

1. Records the current time.
2. Sleeps for the configured interval.
3. Sends an HTTP GET request to `http://192.168.178.32/status.json` with the parameter `components=16384` (`0x4000`), which asks the device for sensor values only. The request has a timeout of 15 seconds.
4. Records the time again and computes the elapsed time in microseconds.
5. Takes the fifth value of the first sensor in the response (`sensor_values[0].values[0][4].v`), treats it as the current power in Watts and multiplies it with the elapsed time. The result is the energy in uJ.

The elapsed time includes the duration of the HTTP request. The energy is thus derived from a single power reading per interval and not from an energy counter of the device.

Since the metric is a machine level energy metric, GMT derives `psu_power_ac_gude_machine` in mW in the phase statistics. If a carbon intensity provider is configured, GMT also derives `psu_carbon_ac_gude_machine` in ugCO2e.

### Caveats

- The provider does not implement its own system check. GMT's default check tries to run `metric-provider-binary -c` in the provider folder. This provider has no such binary, so the check fails with a `FileNotFoundError` and the provider cannot start. You can work around this by skipping all system checks. To do so pass `--dev-no-system-checks` to `runner.py` without a list of check names.
- The IP address of the power meter is hard coded (see above).
