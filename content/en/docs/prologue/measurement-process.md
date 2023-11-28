---
title: "Measurement Process"
description: "Measurement process of the Green Metrics Tool - High level overview"
lead: "Measurement process of the Green Metrics Tool - High level overview"
date: 2022-06-15T08:49:15+00:00
weight: 1003
toc: true
---

The Green Metrics Tool can orchestrate your application by consuming  
what we call the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}}).

This files includes your architecture specification as well as the flow of how to  
interact with the application.

After orchestrating all the services with their respective containers,  
the Green Metrics Tool attaches the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) to the containers.  

The [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) are modular plugins
that query a certain metric source, such as the CPU energy, DRAM energy, machine power, network traffic etc.

<img src="/img/green-metrics-tool-orchestration.webp">

## General Measurement Workflow

A general workflow of a measurement is as follows:

- The repository is checked out
- The [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}}) file is read and processed
- Docker images are pulled or built locally with [Kaniko](https://github.com/GoogleContainerTools/kaniko)
- Networks are created according to the **networks** part in the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}})
- Containers are orchestrated and connected to each other according to the **services** part in the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}})
- During the Boot phase there is an attaching of the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}})
- During the Runtime phase, the **flow** part of the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}}) is run. This part of the `usage-scenario.yml` contains the commands that are executed on the containers.
  + This can be:
    * A Web browser interacting with the webserver container
    * a simple terminal command to execute a machine learning application in a container
    * simulated clicks / keyboard entries to interact with a Desktop application in a container
    * Network simulation tests where containers are added / removed to provoke certain behavior or failure
    * etc.
- The measurement is divided into phases, briefly covered in this high level overview
  + See [Measurement Phases →]({{< relref "/docs/prologue/measurement-phases" >}}) for exact details
- After the flow the data from the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) is collected and parsed
- Saving all to the database and running formatting / aggregations
