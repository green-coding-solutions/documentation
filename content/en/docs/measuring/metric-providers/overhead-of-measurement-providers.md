---
title: "Overhead of Measurement Providers"
description: "How much CPU % and energy doe the metric providers itself draw"
lead: ""
date: 2022-08-04T08:49:15+00:00
weight: 102
---

The Green Metrics Tools measurement providers run on the same system as the software
to be measured.

This allows for easyness of testing, but poses the risk of skewing the measured 
results.

The reporters are designed to have negligeable impact on their own.

## Results for one measurement provider

Tests done with `powerstat`

- All tests executed remotely via SSH
- Values format is: Average - Std.Dev
- powerstat call was "sudo powerstat -R -c -D 1 60".
- 60 samples in 1 s interval

**Average on idle**
- PKG Watts: 2.41 - 0.06
- DRAM Watts: 0.46 - 0.00
- CPU Idle %: 99.5 - 0.4

**measurement provider 10ms to terminal / STDOUT**
- PKG Watts: 2.85 - 0.13
- DRAM Watts: 0.5 - 0.01
- CPU Idle %: 99.4 - 0.5

**measurement provider 1ms to terminal / STDOUT**
- PKG Watts: 4.67 - 0.12
- DRAM Watts: 0.55 - 0.04
- CPU Idle %: 97.7 - 0.7

**measurement provider 10ms to /dev/null via >**
- PKG Watts: 2.69 - 0.39
- DRAM Watts: 0.48 - 0.02
- CPU Idle %: 99.3 - 1.2

**measurement provider 1ms to /dev/null via >**
- PKG Watts: 3.42 - 0.40
- DRAM Watts: 0.49 - 0.02
- CPU Idle %: 98.4 - 0.8

**measurement provider 10ms to file in C (fprintf)**
- PKG Watts: 2.65 - 0.07
- DRAM Watts: 0.47 - 0.00
- CPU Idle %:  99.6 - 0.4

**measurement provider 1ms to file in C (fprintf)**
- PKG Watts: 3.32 - 0.30
- DRAM Watts: 0.49 - 0.02
- CPU Idle %: 98.1 - 0.8

**measurement provider 10ms to file via >**
- PKG Watts: 2.86 - 0.06
- DRAM Watts: 0.48 - 0
- CPU Idle %:  99.5 - 0.3

**measurement provider 1ms to file via >**
- PKG Watts: 3.49 - 0.35
- DRAM Watts: 0.5 - 0.03
- CPU Idle %: 98.3 - 1.3


### Summary
The most costly output is via STDOUT, which is only done if you run 
the measurement provider manually for testing.

In the Green Metrics Tool output is always redirected via POSIX redirection 
to a file. 
This mode has the lowest impact, however not distinguishable from writing to file
directly or to */dev/null*

Since we recommend running the reporters at 100ms for normal analysis we conclude 
that we have a lot of headroom by just running one reporter.


## Running multiple reporters / Full Green Metrics Tool
TODO