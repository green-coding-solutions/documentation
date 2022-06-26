---
title: "RAPL system MSR"
description: "RAPL system MSR metrics provider documentation"
lead: ""
date: 2022-06-02T08:49:15+00:00
draft: false
images: []
---
TODO
- Reads from `/dev/cpu/%d/msr`
- Code mostly pulled from SOURCE
- Currently reads out only energy/power-pkg, which gives the whole CPU package energy of all cores
- Could be extended to caputre DRAM, not available on all platforms => Move this to Joint Research docu project

