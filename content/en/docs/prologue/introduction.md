---
title: "Introduction"
description: "The Green Metrics Tool is a wholistic framework to measure the energy / CO2 of your application."
date: 2022-06-15T08:49:15+00:00
toc: true
weight: 101
---

It is comprised of:

- A Python backend that handles the infrastructure orchestration
- C UNIX-style reporters that generate energy and resource consumption metrics
- A Python API to retrieve metrics
- A native javascript web frontend that visualizes the data from the API with nice charts

{{< slider dir="/img/overview" auto-slide="4000" width="700px" height="350px" no-fa="true" >}}

## Getting to know the Green Metrics Tool

We recommend that you start with the [Philosophy & Methodology →]({{< relref "philosophy-methodology" >}}) part to  
understand the *WHY* of the tool and some design decisions.

After that we recommend the [Measurement Process →]({{< relref "measurement-process" >}}) to  
get a high level overview of *WHAT* the tool does and *HOW*.

From here you can branch off in two paths:

- [Install and measure locally →]({{< relref "/docs/measuring/measuring-locally" >}})
- [Measuring with our hosted service →]({{< relref "/docs/measuring/measuring-service" >}})

However you choose to make the measurements, you are also able to [compare them]({{< relref "/docs/measuring/comparing-measurements" >}}).

### Install and measure locally

Refer to the installation instructions for your OS:

- [Installation on Linux →]({{< relref "/docs/installation/installation-linux" >}})
- [Installation on macOS →]({{< relref "/docs/installation/installation-macos" >}})
- [Installation on Windows (WSL) →]({{< relref "/docs/installation/installation-windows" >}})

Then proceed with [containerizing and measuring your applications →]({{< relref "/docs/measuring/containerizing-applications" >}}) to  
understand how to prepare your app to be measured by the Green Metrics Tool.

Be sure to read the [usage_scenario.json →]({{< relref "/docs/measuring/usage-scenario" >}}) specification to  
get to know the flexibility of our tool to measure your application.

### Measure your own app with our online hosted service

{{< callout context="note" icon="outline/hand-finger-right" >}}
This Quick Start is intended to give you an idea how the tool works and how a measurable application looks like
{{< /callout >}}

[Measuring with our hosted service →]({{< relref "/docs/measuring/measuring-service" >}})

The app you submit to our hosted service must conform  
to the [usage scenario specification]({{< relref "/docs/measuring/usage-scenario" >}})  and be [containerized]({{< relref "/docs/measuring/containerizing-applications" >}}).

After that you can look at our [Example Apps Repository](https://github.com/green-coding-solutions/example-applications) to see some prepared apps that can be directly measured.

## Help: FAQ / Troubleshooting

- [FAQ →]({{< relref "/docs/help/faq" >}})
- [Troubleshooting →]({{< relref "/docs/help/troubleshooting" >}})
