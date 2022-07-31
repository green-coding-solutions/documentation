---
title: "Introduction"
description: "The Green Metrics Tool is a wholistic framework to measure the energy / co2 of your application."
lead: "The Green Metrics Tool is a wholistic framework to measure the energy / co2 of your application."
date: 2022-06-15T08:49:15+00:00
toc: true
weight: 1001
---

It is comprised of:
- A Python backend that handles the infrastructure orchestration
- C UNIX-style reporters that generate energy and resource consumption metrics
- A Python API to retrieve metrics
- A native javascript web frontend that visalizes the data from the API in some nice charts

<img src="/img/green_metrics_dashboard.webp">

## Getting to know the Green Metrics Tool

We recommend that you start with the [Philosophy & Methodology →]({{< relref "philosophy-methodology" >}}) part 
to understand the *WHY* of the tool and some design decisions.

After that we recommend the [Measurement Process →]({{< relref "measurement-process" >}}) to get a high level overview
of *WHAT* the tool does and *HOW*.

From here you can branch off in two paths:

### Measure your own app with our online hosted service

[Measuring with our hosted service →]({{< relref "measuring-service" >}}) 

This is a one page summary of how to measure a sample application.
{{< alert icon="👉" text="This Quick Start is intended to give you an idea how the tool works and how a consumeable application looks like" />}}

After that you can look at our [Example Apps Repository](https://github.com/green-coding-berlin/example-applications) to see some prepared apps that can be directly consumed.

Your app must conform to the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) specification and be [Containerized →]({{< relref "containerizing-applications" >}})


### Install and measure locally
Under [Installation →]({{< relref "installation-overview" >}}) you find the detailed installation instructions.

Then proceed with [Containerizing and measuring own applications →]({{< relref "containerizing-applications" >}}) to understand
how to prepare your app to be consumed by the Green Metrics Tool.

Then be sure to read the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) specification to get to know the flexibility of 
our tool to measure your application.

Then proceed to [Measuring Locally]({{< relref "measuring-locally" >}})


## Help: FAQ / Troubleshooting

- [FAQ →]({{< relref "faq" >}})
- [Troubleshooting →]({{< relref "troubleshooting" >}})
