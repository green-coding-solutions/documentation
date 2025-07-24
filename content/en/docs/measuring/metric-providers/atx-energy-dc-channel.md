---
title: "ATX Energy DC Channel"
description: "Documentation for the DC energy metrics provider of the Green Metrics Tool"
date: 2022-08-13
draft: false
images: []
weight: 100
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
This is a legacy provider and is not maintained anymore. It is only used in an old version of the Green Metrics Tool!
{{< /callout >}}

## What it does

This metric provider reads the the voltage from the DC channels of the ATX connector
on the mainboard through shunt resistors and converts the voltage to an energy reading.

The reporter is different from the purely software based, as it collects the metrics
through an external device: [Picotech PicoLog HDR ADC 24](https://www.picotech.com/data-logger/adc-20-adc-24/precision-data-acquisition)

### Classname

- None

Only an importer script is needed to ingest the metrics.

### Input Parameters

The AppImage must be called in order to start the measurement.

All values should be configured with `100 ms` time resolution and `+/- 625 mV` sensitivity range.

Furthermore the output should show as `mV`

The script will detect the measurement resolution automatically though if you alter it.

<img src="/img/picolog_hdr_adc_24_fujitsu_esprimo_P956.webp" alt="PicoLog HDR ADC 24 connected to Fujitsu Esprimo P956 for DC power measurement">

### Example call

```bash
python3 tools/dc_converter.py filename project_id db_host db_pw
```

### Software

We are using the [Piclog 6.2.5 AppImage](https://www.picotech.com/download/software/picolog6/sr/picolog-6.2.5-x86_64.AppImage) on Ubuntu 22.04
