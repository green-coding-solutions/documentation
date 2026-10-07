---
title: "RAPL container MSR"
description: "RAPL container MSR metrics provider documentation"
date: 2022-06-24T08:49:15+00:00
draft: true
images: []
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
There is no such provider in the Green Metrics Tool. This page is only kept as a design note on the splitting approach.
{{< /callout >}}

In order to split the energy usage to the container level we use IC splitting.

This is to be preferred over time splitting as outlined in this source for instance:
[https://www.brendangregg.com/blog/2017-05-09/cpu-utilization-is-wrong.html](https://www.brendangregg.com/blog/2017-05-09/cpu-utilization-is-wrong.html)
