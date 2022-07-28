---
title: "Introduction"
description: "The Green Metrics Tool is a wholistic framework to measure the energy / co2 of your application."
lead: "The Green Metrics Tool is a holistic framework to measure the energy / co2 of your application."
date: 2022-06-15T08:49:15+00:00
draft: false
toc: true
---

It is comprised of:
- An Open Data API to retrieve metrics
- A web frontend that displays the Open Data in some nice charts
- A Python backend that handles running the tests

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
<<<<<<< HEAD
{{< alert icon="👉" text="The Quick Start is intended to get you up and running quickly to measure one of your applications" />}}
=======
{{< alert icon="👉" text="This Quick Start is intended to give you an idea how the tool works and how a consumeable application looks like" />}}
>>>>>>> b61627b80b4fae2e55b5d2fd3847318c856cb91a

After that you can look at our [Example Apps Repository](https://github.com/green-coding-berlin/example-applications) to see some prepared apps that can be directly consumed.

Your app must conform to the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) specification and be [Containerized →]({{< relref "containerizing-applications" >}})


### Install and measure locally
Under [Installation →]({{< relref "installation-overview" >}}) you find the detailed installation instructions.

Then proceed with [Containerizing and measuring own applications →]({{< relref "containerizing-applications" >}}) to understand
how to prepare your app to be consumed by the Green Metrics Tool.

<<<<<<< HEAD
Be sure to read the [usage_scenario.json →]({{< relref "usage-scenario" >}}) specification to get to know the flexibility of 
=======
Then be sure to read the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) specification to get to know the flexibility of 
>>>>>>> b61627b80b4fae2e55b5d2fd3847318c856cb91a
our tool to measure your application.

Then proceed to [Measuring Locally]({{< relref "measuring-locally" >}})


## Help: FAQ / Troubleshooting

- [FAQ →]({{< relref "faq" >}})
- [Troubleshooting →]({{< relref "troubleshooting" >}})
