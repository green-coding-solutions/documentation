---
title: "PSU Energy - AC - MCP (MCP39F511N)"
description: "Documentation for PsuEnergyAcMcpMachineProvider of the Green Metrics Tool"
lead: ""
date: 2023-10-20T08:16:35+0000
draft: false
images: []
weight: 172
---


### What it does

This metric provider uses the [MCP39F511N chip](https://www.microchip.com/en-us/product/mcp39f511n) to read the power used by a device plugged into it. Normally this would be the device we are benchmarking.

We use the board implementation here: [AMD00706](https://www.microchip.com/en-us/development-tool/ADM00706)

**Spec highlights:**
- 0,5% Accuracy on active power measurements in a 1:4000 dynamic range (~ 3.75 mW minimum resolution)
- 8 MHz internal processing clock (theoretical maximum of 12.5 us resolution)
- Internal accumulation of energy in register (currently not active in our setup. We use active power only atm.)


Implementation of the source code is mostly copied from https://github.com/osmhpi/pinpoint/blob/master/src/data_sources/mcp_com.c
Credits to Sven Köhler and the OSM group from the HPI

### Install

All compilations and linking will be done through the install script.

After that just plug it into your USB and please use Channel 1.

### Classname

- PsuEnergyAcMcpMachineProvider

### Input Parameters

- `-i`: interval in milliseconds. By default the measurement interval is 100 ms.


```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to stdout a continuous stream of data every `interval` milliseconds till it is stopped with
`sigkill` or `sigint` (Ctrl-c). The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The value taken from sensor in the unit supplied or mW if no unit is specified.

Any errors are printed to stderr.

