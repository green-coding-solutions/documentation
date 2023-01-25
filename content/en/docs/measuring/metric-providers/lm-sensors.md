---
title: "LM Sensors - temp - fanspeed"
description: "Documentation for LmSensorsProvider of the Green Metrics Tool"
lead: ""
date: 2022-12-29T20:16:35+0000
draft: false
images: []
weight: 115
---
### What it does

This metric provider uses the [lm_sensors](https://github.com/lm-sensors/lm-sensors)
[package](https://packages.ubuntu.com/search?keywords=lm-sensors) to read a multitude of values from the computer.
Mostly temperatures from various hardware components and fan speeds.

### Install

You will need  `sudo apt install libsensors-dev` installed on a Debian based distro. Further you will need to run
the detect program first `sudo sensors-detect` which looks at all the chips in your computer and creates the config
file.

### Classname
- LmSensorsFanProvider
- LmSensorsTempProvider

these both extend the `LmSensorsProvider` which makes it very easy to add new specific providers. We need to separate
fan and temperature because they both come in different units. Temp in °C or °F and fan speeds in RPM.

### Input Parameters

To make the tool as useful as possible it takes multiple filter parameters:

- `-c`: this is a list of strings defining the chips that should be queried. When looking at the output of sensors you can
    see the the chip being described like `coretemp-isa-0000`. You can filter for all coretemp chips by just supplying
    `-c coretemp` this will match `coretemp*`

- `-f`: the features to output. These will need to be part of a chip. This can also be a list and will match the
    beginning. `-f fan` will match `fan0` and `fan1`

Please remember that the metric provider can only understand one type of unit. So please don't mix fan with temperature
when configuring.

The tool also accepts more general parameters:

- `-i`: interval in milliseconds. By default the measurement interval is 100 ms.

- `-s`: it is possible to pass in a lm_sensors config file if you don't want to use the system one.

- `-t`: this will output in degrees fahrenheit. This is not recommended when using it in the green coding context!

- `-h`: displays a little help message.

```bash
> ./metric-provider-binary -c coretemp-isa-0000 -f "Package id 0" -i 100
```

Calling the metric-provider without any parameters will output all the values the package can read. This is for
debugging!

### Output

This metric provider prints to stdout a continuous stream of data every `interval` milliseconds till it is stopped with
`sigkill` or `sigint` (Ctrl-c). The format of the data is as follows:

`TIMESTAMP READING FEATURE-NAME`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The value taken from sensors.
- `FEATURE-NAME`: Which feature the reading comes from

Please note that if we are looking at temperatures, which come as floats, we multiply the value with 100 to work with
integers. So a temperature of `64,87`°C will be outputted as `6487`.

Any errors are printed to stderr.
