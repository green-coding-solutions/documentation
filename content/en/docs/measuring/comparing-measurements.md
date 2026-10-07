---
title: "Comparing measurements"
description: "Comparing measurements"
date: 2023-05-30T08:49:15+00:00
weight: 435
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
* Different Usage Scenarios
  - How resource intense are certain processes of your software?
* Different Usage Scenario Variables
  - Modular approach for comparison. Basically a mix of all of the above is possible through this
* Different machines
  - Understand how the software behaves on different hardware configurations

The tool will let you know if you try to compare measurements that can't be compared.

To trigger a comparison in the frontend just tick the boxes of the runs you wish to compare and click the *Compare: N Run(s)* button.

<img class="ui centered rounded bordered" src="/img/measuring/triggering_compare_mode.webp" alt="Triggering Compare mode">

Example of a comparison display

<img class="ui centered rounded bordered" src="/img/overview/comparison.webp" alt="Comparison">

When comparing measurements, you will see the standard deviance on the key metrics  
and in a column under the detailed metrics.
<img class="ui centered rounded bordered" src="/img/compare_metrics.webp" alt="Comparison of detailed metrics">

Graphs will also include the confidence interval.

<img class="ui centered rounded bordered" src="/img/overview/compare_charts.webp" alt="Graphs with confidence interval when comparing measurements">

Comparing measurements should help raise awareness of software energy use over time.

## Forcing a comparison mode

In some instances the GMT will not allow certain comparisons. For instance when you compare different machines and also
different repositories.
A comparion like this *sounds unreasonable* for the GMT as machine and comparing should not be changed simultaneusly.

But still there might be instances when you want to force a certain comparison type. For instance when the repository
is basically the same as the old one, just has been renamed. GMT does not understand repository renaming currently.

In that or similar cases you can override the default *comparison mode auto detection*.

As soon as you tick at least one run a *Mode* dropdown appears next to the *Compare* button. It defaults to *Auto*, which
is the comparison mode auto detection. To force a mode set it to one of *Branches*, *Commits*, *Machines*,
*Usage Scenarios*, *Variables*, *Repos* or *Simple Table*. Your selection is remembered for the next comparison.

For instance treating runs from different repositories and branches with different commits, which however have run on the
same machine as a *Machines* comparison will effectively compare them as being just repeated runs on the same machine.

<img class="ui centered rounded bordered" src="/img/measuring/expert_compare_mode.webp" alt="Forcing a comparison mode">

Your runs must in any case have one common demoniator, that has at max two values. For instance:

- Different repositories and branches but run on one machine
- Many different machines and branches, but only two different repositories

## Statistical significance

### Comparing runs with differentiating features

When running a comparison between different commits, different machines etc. the GMT will
also compute a *T-test* for the two samples.

It will calculate the *T-test* for the means of two independent samples of scores without assuming equal variances. (Some might know this test also as *Welch’s t-test* or *Welch test*)

If the *p-value* is lower than **0.05** GMT will show the result as significant.

GMT will provide the *p-value* directly in the API output of the comparison.
In the frontend the *Significant (T-Test)* column will read *Significant*, or *not significant / no-test*. The latter also
covers the case that no test could be made because there where too many missing values or the metric was not present in
all runs.

Note that the green / red coloring is not an indicator for significance. It is applied to the *Change* column only and
merely tells you if the value went up (red) or down (green).

<img class="ui centered rounded bordered" src="/img/measuring/gmt_t_test_two_samples.webp" alt="Green Metrics Tool T-test comparison showing statistical significance indicators">

### Comparing repeated runs

When running a comparison of repeated runs with no diffentiating criteria like different commits, repos etc. the GMT will run a *1-sample T-test*.
Effectivly answering the question: "Did the last run in the set of repeated runs have a siginificant variation to the ones before".

This question is very typical as you will have a set of a couple of runs once measured. Then you come back to your code and just re-measure out. The value is now different and you want to tell if it is *significantly different*.

If the *p-value* is lower than **0.05** GMT will show the result as significant.

GMT will provide the *p-value* directly in the API output of the comparison.

Since repeated runs have no second key to compare against, the detailed metrics table in the frontend has no
*Significant (T-Test)* column in this case. The *p-value* is only available through the API.
