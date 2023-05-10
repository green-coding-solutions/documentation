---
title: "PSU Energy - DC - Picolog - System"
description: "Documentation for PsuEnergyDcPicologSystemProvider of the Green Metrics Tool"
lead: ""
date: 2022-08-04T08:49:15+00:00
weight: 160
---

# ⚠️Warning - LEGACY PROVIDER⚠️
This is a legacy provider and is not maintained anymore. It is only used in an old version of the Green Metrics Tool!


### What it does
It measures the DC energy by intercepting the cable pathway from the PSU
to the ATX mainboard connector.

### Classname
- PsuEnergyDcPicologSystemProvider

### Prerequisites

The provider requires special hardware to work: 
- [PicoLog HRDL ADC-24](https://www.picotech.com/data-logger/adc-20-adc-24/precision-data-acquisition)
- [Terminal board](https://www.picotech.com/accessories/terminal-boards/adc-20-24-terminal-board)
- Custom ATX Y-cable

The provider is designed to only work with the 12-Pin ATX format from Fujitsu
and assumes that all 12 V power rails are funneld together and sent over one 
shunt resistor.

The *11 Vsb* and *PWR_ON, PWR_OK* rails are ignored as they carry not load.

The resistor is assumed to be a [Isabellenhütte PBV 0,005 Ohm](Isabellenhütte PBV 0,005 Ohm).

<figure>
  <img src="/img/fujitsu_esprimo_p956_ATX_pinout.webp">
  <figcaption>ATX original pinout</figcaption>
</figure>

<figure>
  <img src="/img/atx_y_cable.webp">
  <figcaption>ATX Y-Cable to connect shunt resistor and mainboard</figcaption>
</figure>

<figure>
  <img src="/img/shunt_resistor_wiring.webp">
  <figcaption>Shunt resistor wiring on Terminal Board</figcaption>
</figure>

### Configuration

The provider is designed to run at a fixed sampling frequency of **61 ms**, which
is the maximum resolution the PicoLog HRDL ADC-24 can provide for one channel.

Please do not change this value in the `config.yml`

The provider will configure the PicoLog HRDL ADC-24 into streaming mode with 
*60 ms* frequency sampling and capture the data every *61 ms*

### Input Parameters

- args
    - `-i`: interval in milliseconds

By default the measurement interval is *1000 ms*, which however is only for testing 
purposes.

As stated in the paragraph before the provider should always be used with *61 ms* samling frequency

```
> ./metric-provider-binary -i 61
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The measured energy in millijoules

Any errors are printed to Stderr.

### Troubleshooting

If you cannot get a reading from the PicoLog HRDL ADC-24 try disconnecting the USB
and reconnecting. It is very prone to getting stuck in the capture loop and then
does not accept connections anymore.

### Overhead warning
The provider has a significant energy overhead when used as it draws power
from the USB port of the system.

In our test system the PicoLog HRDL ADC-24 draws about **0.5 W on Stand-By** and
about **6 W when used with a 61 ms capture resolution**.

If you are using a AC reporter in conjuction this will heavily skew your signal.
Please either use only an AC or DC reporter, or correct the output data 
accordingly afterwards.