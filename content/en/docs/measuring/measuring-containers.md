---
title: "Estimating Containers"
description: ""
date: 2025-05-25T01:49:15+00:00
weight: 442
toc: false
---

GMT is container native when it comes to orchestrating the application and capturing performance metrics. 
But typically the energy of the [Metric Providers]({{< relref "/docs/measuring/metric-providers/" >}}) are system level.

If you want to drill down the energy on a per-container level GMT offers to create an estmation based on the CPU utilization of the system.

### Setting up container estimations

Prerequisites
- You must have a PSU [Metric Provider]({{< relref "/docs/measuring/metric-providers/" >}}) activated
- You must have a System level CPU Utilization [Metric Provider]({{< relref "/docs/measuring/metric-providers/" >}}) activated
- You must have a Container level CPU Utilization [Metric Provider]({{< relref "/docs/measuring/metric-providers/" >}}) activated

GMT will then

- Takes the baseline energy value of the machine
- Takes the runtime energy value of the machine
- Creates a difference
- Splits the resulting difference proportionally to the individual container's CPU% in relation the other containers CPU% share

Example:

<img class="ui centered rounded bordered" src="/img/measuring/container_power_attribution.webp" alt="Container Power Attribution">

The difference between *Container Power* and *Container Power (+Baseline Share)* is that the *Container Power* is the overhead / additional power additional to the power that the system was already drawing during the baseline when no containers where launched.

*ontainer Power (+Baseline Share)* includes the attributional share of the baseline load also. It is split also according to the container's CPU% in relation the machine's CPU% share.
This means that a container that has 20% CPU-Utilization in comparison to the other containers will also get 20% of the baseline power draw attributed.


#### Requirements for reproducibility

This method only works if the baseline is long enough (the cluster ensures this with a 60-second timeframe) and the CPU is set to a fixed frequency without Hyperthreading and TurboBoost. Otherwise, you'll get incorrect allocations, as, for example, "30% CPU Utilization" no longer has a clear meaning due to the limited cycle count.

However, there is a good approximation.


#### Limitations

The value is still shaky, because although utilization is more stable with a controlled  cluster setup, it's not as good as, for example, CPU instructions (which would require PMU sampling), and non-CPU energy is only considered indirectly.

So, if you execute strange CPU instructions, such as AVX instructions or CPU steal time, or if you have a hard drive that executes asynchronous workloads like TRIM independently of CPU instructions, this will distort the energy evaluation.



#### Addon: Detailed CPU energy drill-down

We currently have a beta feature to be launched in Summer 2025 that utilizes AMD RAPL per-core energy registers and core-pinning to report individial container CPU energy metrics.

The GMT will utilize a `taskset` to pin the container to a distinct core. Since no other processes are running on your benchmarking systems in [Green Metrics Tool Cluster Hosted Service →]({{< relref "/docs/measuring/measuring-service" >}}) the values are very reliable.

Private beta opens Summer 2025. If you are interested shoot us an email to [info@green-coding.io](mailto:info@green-coding.io)
- The energy of the browser is measured to display and render the page
- The network transfer energy is measured that was needed to download the HTML and page assets

To isolate this as best as possible GMT orchestrates a reverse proxy, warms up the cache by pre-loading the full page once and only then does the final measurement.

