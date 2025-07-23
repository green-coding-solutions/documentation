---
title: "Measuring Websites"
description: ""
date: 2025-05-23T01:49:15+00:00
weight: 441
toc: true
---

GMT can also measure websites and takes a multi-dimensional approach here:

- The energy of the browser is measured to display and render the page
- The network transfer energy is measured that was needed to download the HTML and page assets

To isolate this as best as possible GMT orchestrates a reverse proxy, warms up the cache by pre-loading the full page once and only then does the final measurement.

**Warning:** Measuring websites is very tricky! GMT shaves off some of the caveats by using reverse proxys and cache pre-loading to make results more reliable. Since measurement load times are in milliseconds range you must have [Metric Providers]({{< relref "/docs/measuring/metric-providers/" >}}) with very high *sampling_rates* connected. **2ms** is a good value. Also website measurements are really only realiable in a [controlled cluster]({{< relref "/docs/cluster/" >}}) with [accuracy control]({{< relref "/docs/cluster/accuracy-control" >}}).

#### Quick website measuring

Since measuring websites is so common GMT comes with a quick measurement function for that.

In the root folder you find the `run-template.sh` file.

Measure a sample query like this: `bash run-template.sh website "https://www.green-coding.io"`

It will download the needed containers, setup them up and run the measurement. Once you got this quick measurement running iterate on it by extending the [example measurement file](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/templates/website/usage_scenario.yml) with more steps, for instance measuring all the sub-pages on your domain

Bonus tip: If you apply `--quick` to the `run-template.sh` call the measurement is quicker for debugging purposes. However results will be not as reliable. Use only for debugging!

#### Trying out our hosted service

We operate [website-tester.green-coding.io](https://website-tester.green-coding.io) as a simple demo vertical that uses the underlying [Green Metrics Tool Cluster Hosted Service →]({{< relref "/docs/measuring/measuring-service" >}}).

Check it out if you do not feel like installing the GMT and just want to get carbon and energy info on a single page.
