---
title: "Measurement Process"
description: "Measurement process of the Green Metrics Tool - High level overview"
lead: "Measurement process of the Green Metrics Tool - High level overview"
date: 2022-06-18T08:00:00+00:00
draft: false
images: []
menu:
  docs:
    parent: "prologue"
weight: 120
toc: true
---

The Green Metrics Tool can orchestrate your application by consuming what we call
the [usage_scenario.yml →]({{< relref "usage-scenario" >}}).

This files includes your architecture specification as well as the flow of how to 
interact with the application.

After orchestrating all the services with their respective containers the Green Metrics Tool
attaches the *Metric Reporters* to the containers.
The *Metric Reporters* are to be understood as 
<img src="/img/green-metrics-tool-orchestration.webp">


- [usage_scenario.yml →]({{< relref "usage-scenario" >}}) file is read
- Containers are downloaded from Docker Hub or from local docker cache
- Networks are created according to the **networks** part in the [usage_scenario.yml →]({{< relref "usage-scenario" >}})
- Containers are orchestrated connected to each other according to the **services** part in the [usage_scenario.yml →]({{< relref "usage-scenario" >}})
- X Seconds Idle (5 seconds by default)
- Attaching of the [Metric Providers →]({{< relref "metric-providers-overview" >}})
- **flow** part of the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) is run. This part of the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) contains
 the commands that are executed on the containers.
    + This can be: 
        * A Webbrowser interacting with the webserver container
        * a simple terminal command to execute a machine learning application in a container
        * simulated clicks / keyboard entries to interact with a Desktop application in a container
        * Network simulation tests where containers are added / removed to provoke certain behaviour or failure
        * etc. 
- X seconds idle (5 seconds by default)
- After the flow the data from the [Metric Providers →]({{< relref "metric-providers-overview" >}}) is collected and parsed
- Saving all to the database and running formatting / aggregations