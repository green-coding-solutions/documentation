---
title: "NOP Linux"
description: "NOP Linux setup for machines in the Green Metrics Tool cluster"
lead: ""
date: 2024-10-25T01:49:15+00:00
weight: 103
---

When benchmarking software it is important to have reproducible results between runs. It often occurrs that some OS background process would kick in while a benchmark was running and such the resource usage did not reflect the actual usage. To combat this we developed NOP Linux with the aim to reduce noise in measurements.

We recommend tuning the Linux OS on all linux measurement machines that you have in your cluster to get the highest reproducability out of your measurement runs.

For a detailed description on how to produce your own NOP Linux instance visit [our blog article on NOP Linux](https://www.green-coding.io/blog/nop-linux/).