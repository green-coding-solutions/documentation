---
title: "PSU Energy AC - IPMI machine"
description: "Documentation for PsuEnergyAcIpmiMachineProvider of the Green Metrics Tool"
lead: ""
date: 2023-06-23T11:01:35+0000
draft: false
images: []
weight: 171
---
### What it does

This metric provider uses the [IPMI protocol](https://en.wikipedia.org/wiki/Intelligent_Platform_Management_Interface) to get sensor data from the current power
draw of the system. 
This can either come from a sensor that is accessible via `ACPI` or via other means through the `libsensors`.

### Install

You will need  `sudo apt-get install freeipmi-tools ipmitool` installed on a Debian based distro. 
This installation step will automatically happen if you normally install the tool with the `./install_linux.sh` script.

The install script will also set a `sudoers.d` entry so that the underlying 
program `/usr/sbin/ipmi-dcmi --get-system-power-statistics` can execute without password request.

On some systems you will need to run the detect program first `sudo sensors-detect` which looks at all the chips 
in your computer and creates the config file.

### Classname
- PsuEnergyAcIpmiMachineProvider

### Input Parameters

- `-i`: interval in milliseconds. By default the measurement interval is 100 ms.


```bash
> ./ipmi-get-machine-energy-stat.sh -i 100
```

### Output

This metric provider prints to stdout a continuous stream of data every `interval` milliseconds till it is stopped with
`sigkill` or `sigint` (Ctrl-c). The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The value taken from sensors.

Any errors are printed to stderr.
