---
title: "Server Calibration"
description: "A description on how to calibrate the system"
lead: ""
date: 2023-06-26T01:49:15+00:00
weight: 903
---

## Problem

Servers vary greatly in how they perform in terms of energy and cooling. This is quite important for us as temperature
directly interferes with power consumption. A hot CPU takes significant more energy for the same operation as a cool one.
So it is important that we don't run benchmarks right after each other to give the system time to cool down. For this
we have the `sleep_time_after_job` parameter in the [`config.py`](/docs/installation/installation-cluster/)
where you can set how long to sleep between jobs.

To find out this value we have a script `tools/calibrate.py` in the Green Metrics Tool
[repo](https://github.com/green-coding-berlin/green-metrics-tool). On the system that you want to run your benchmarks on
you can execute this script to get the cool down period. The script is called with `python3 calibrate.py`

You can then either get the script to set the correct value for you or set it yourself.

## Parameters:

- `--dev`: Enable development mode with reduced timing.
- `--write-config`: Skips the config write dialog and just writes it.
- `--idle-time`: The seconds the system should wait in idle mode. Defaults to 5 minutes
- `--stress-time`: The seconds the system should stress the system. Defaults to 2 minutes
- `--cooldown-time`: The seconds the system should wait to be back to normal temperature. Defaults to 5 minutes
- `--provider-interval`: The interval in milliseconds for the providers . Defaults to 5000
- `--stress-command`: The command to stress the system with. Defaults to stress-ng
- `--log-level`: Logging level (debug, info, warning, error, critical)
- `--output-file`: Path to the output log file.

## Return codes

If the program exits because of an error you can use the return code to see why:

1) no psu and temp provider configured
2) stress command failed
3) temperature never falls below mean
4) outliers in idle measurement

## Output

Important values that are extracted:
```
[INFO] -  Cool down time is 4 seconds
[DEBUG] - Power mean is {'Package_0': 3224.3333333333335}
[DEBUG] - Temperature means are {'acpitz-acpi-0_temp1': 5433.333333333333, 'coretemp-isa-0000_Package-id-0': 5400.0}
```

Please remember that we multiply the values with 100 to avoid integers in the database

<img class="ui centered rounded bordered image" src="/img/callibration.webp">

## Future work

For now this is only relevant for temperature cool downs. We already collect energy data so that in the future we
can use this to check if the system is currently running idle when starting the GMT. Also we can use the tool to
benchmark new metric providers and see how much overhead they create.