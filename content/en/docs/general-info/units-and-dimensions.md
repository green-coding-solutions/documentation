---
title: "Units & Dimensions"
description: "Units and dimensions in the Green Metrics Tool"
date: 2024-10-25T07:49:15+00:00
weight: 201
toc: true
---

## Measurement

This paragraph looks at the units and dimensions when using the measurement functionality of GMT.

### Units and dimensions

- Energy - micro-Joules [uJ] (64-bit int)
- Power - milli-Watts [mW] (64-bit int)
- Data / Memory Usage - Bytes (64-bit int)
- I/O - Bytes/s  (64-bit int)
- Carbon - micro-Grams [ug]  (64-bit int)
- Temperature - centi°C  (64-bit int)
- Utilization - Ratio   (64-bit int)
- SCI - ugCO2e/R  (64-bit int)
- Frequency - Hz  (64-bit int)
- Time - micro-Seconds [us]  (64-bit int)

#### Bytes / Bytes/s are SI-Units

It is very important to note that GMT uses SI-Units for Bytes.

This means that 1 kB means 1.000 Bytes and not 1.024 Bytes as it would in non-SI-Units or binary display schemes.

This notation is in line with newest international number standards.

See the [Wikipedia Page](https://de.wikipedia.org/wiki/Byte) for details.

### Lowest possible resolution / precision

Since all values are stored as 64-bit integer values the smallest resolution the GMT can understand is dicretly derived from the dimension that we store.

Example: No energy value below 1 micro-Joules can be understood and will be rounded off as we store all energy in micro-joules precision

For temperature it is similar. Since we store in centi°C the smallest resolution is 0.01 °C, which we store as 1 cent°C.

Identical for Utilization where 0.01 is the smallest value.

## CarbonDB

CarbonDB stores energy and carbon as 64-bit floating point values. Respectively:

- Carbon - Kilograms [kg] (64-bit double precision)
- Energy - Kilowatt-hours [kWh] (64-bit double precision)

The carbon intensity is stored next to them as a plain integer in gCO2e/kWh, so its smallest resolution is 1 gCO2e/kWh.

Note that this is only the storage scheme, and that it differs from what the API accepts:

- Energy is submitted in micro-Joules [uJ] and converted to kWh on ingest.
- The carbon intensity is submitted in gCO2e/kWh and stored as-is.
- Carbon is never submitted. It is derived on ingest as `energy_kWh * carbon_intensity_g / 1000`. If no intensity was supplied it stays empty until it is backfilled.

Thus the lowest resolution is directly derived from the storage scheme and to keep it brief: It is absurdly large, as well as absurdly small :)
