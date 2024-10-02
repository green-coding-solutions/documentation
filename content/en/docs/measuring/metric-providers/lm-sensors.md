---
title: "LM Sensors - temp - fanspeed"
description: "Documentation for LmsensorsProvider of the Green Metrics Tool"
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

The required libraries are installed automatically via the `install-linux.sh` call when installing the Green Metrics Tool. However for completeness, these are the libraries installed:

{{< tabs groupId="sensors">}}
{{% tab name="Ubuntu" %}}

```bash
sudo apt install -y lm-sensors libsensors-dev libglib2.0-0 libglib2.0-dev
```

{{% /tab %}}
{{% tab name="Fedora" %}}

```bash
sudo dnf -y install lm_sensors lm_sensors-devel glib2 glib2-devel
```

{{% /tab %}}
{{< /tabs >}}

If you want the temperature metric provider to work you need to run the sensor detector

```bash
sudo sensors-detect
```

in order to detect all the sensors in your system. One you have run this you should be able to run the

```bash
sensors
```

command and see your CPU temp. You can then use this output to look for the parameters you need to set in the `config.yml`.
For example if sensors gives you:

```bash
coretemp-isa-0000
Adapter: ISA adapter
Package id 0:  +29.0°C  (high = +100.0°C, crit = +100.0°C)
Core 0:        +27.0°C  (high = +100.0°C, crit = +100.0°C)
Core 1:        +27.0°C  (high = +100.0°C, crit = +100.0°C)
Core 2:        +28.0°C  (high = +100.0°C, crit = +100.0°C)
Core 3:        +29.0°C  (high = +100.0°C, crit = +100.0°C)
```

Your config could be:

```bash
lmsensors.temperature.provider.LmsensorsTempComponentProvider:
    resolution: 100
    chips: ['coretemp-isa-0000']
    features: ['Package id 0', 'Core 0', 'Core 1', 'Core 2', 'Core 3']
```

As the matching is open ended you could also only use `'Core'` instead of naming each feature.

### Classname

- `LmsensorsFanComponentProvider`
- `LmsensorsTempComponentProvider`

these both extend the `LmsensorsProvider` which makes it very easy to add new specific providers. We need to separate
fan and temperature because they both come in different units. Temp in °C or °F and fan speeds in RPM.


### Metric Name

- `lmsensors_fan_component`
- `lmsenors_temp_component`

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

- `-s`: it is possible to pass in a `lm-sensors` config file if you don't want to use the system one.

- `-t`: this will output in degrees fahrenheit. This is not recommended when using it in the green coding context!

- `-h`: displays a little help message.

```bash
./metric-provider-binary -c coretemp-isa-0000 -f "Package id 0" -i 100
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
