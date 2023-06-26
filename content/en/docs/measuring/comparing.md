---
title: "Comparing measurements"
description: "Comparing measurements"
date: 2023-05-30T08:49:15+00:00
weight: 807
toc: true
---

The Green Metrics Tool has the capability to compare two or more measurements.

Comparing measurements is intended to give an insight into the order of magnitude  
of energy the running software is consuming under certain circumstances.

Ultimately, these cases for comparing measurements should span the entire  
lifecycle of software development and use.

Comparison is currently possible for measurements that are:

* Repeated runs
  - Measurements that were run under the same configuration
* Different commits
  - Insight into the evolution of the repository over time
* Different branches
  - Determine the impact of new features or refactors
* Different repositories
  - Which 3rd party dependency meets your requirements better and at what cost?
* Different usage scenarios
  - How resource intense are certain processes of your software?
* Different machines
  - Understand how the software behaves on different hardware configurations

The tool will let you know if you try to compare measurements that can't be compared.

<img class="ui centered rounded bordered" src="/img/comparison.webp" alt="Comparison">

When comparing measurements, you will see the standard deviance on the key metrics  
and in a column under the detailed metrics.
<img class="ui centered rounded bordered" src="/img/compare_metrics.webp" alt="Comparison of detailed metrics">

Graphs will also include the confidence interval.

<img class="ui centered rounded bordered" src="/img/compare_charts.webp" alt="Graphs with confidence interval when comparing measurements">

Comparing measurements should help raise awareness of software energy use over time.
