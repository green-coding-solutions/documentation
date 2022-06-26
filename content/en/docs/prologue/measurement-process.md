---
title: "Measurement Process"
description: "Measurement process of the Green Metrics Tool - High level overview"
lead: "Measurement process of the Green Metrics Tool - High level overview"
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu:
  docs:
    parent: "prologue"
weight: 100
toc: true
---


TODO

- [usage_scenario.json →]({{< relref "usage-scenario" >}}) file is read
- Containers are downloaded from Docker Hub or from local docker cache
- Containers are orchestrated connected to each other according to the **setup** part in the [usage_scenario.json →]({{< relref "usage-scenario" >}})
- 5 Seconds Idle
- Attaching of the [Metric Providers →]({{< relref "metric-providers-overview" >}})
- **flow** part of the [usage_scenario.json →]({{< relref "usage-scenario" >}}) is run. This part of the [usage_scenario.json →]({{< relref "usage-scenario" >}}) contains
 the commands that are executed on the containers.
    + This can be: 
        * A Webbrowser interacting with the webserver container
        * a simple terminal command to execute a machine learning application in a container
        * simulated clicks / keyboard entries to interact with a Desktop application in a container
        * Network simulation tests where containers are added / removed to provoke certain behaviour or failure
        * etc. 
- 5 seconds idle
- After the flow the data from the [Metric Providers →]({{< relref "metric-providers-overview" >}}) is collected and parsed
- Saving all to the database and running formatting / aggregations