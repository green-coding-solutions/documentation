---
title: "Observability"
description: "Observability in cluster mode"
date: 2024-06-26T01:49:15+00:00
weight: 1007
---

When running *cluster* mode the GMT execute automated processes through *cron jobs* but also through *control workloads*.

Nonetheless there is the basic operation of the webserver and database to have a central datastore and provide a dashboard.

GMT provides two approaches to get insights into the cluster operations.

## Status Page

Under the `/status.html` page of your GMT installation you can find a status page that contains:

- Currently configured machines in the cluster
- Current temperature, installed GMT version and measurement configuration of the machines in the cluster
- Waiting times for scheduling a jobs on the machines in the cluster
- Current jobs in the queue for the cluster

## Energy consumption & CO2 emissions

Measuring and deriving optimizations costs a lot of energy and it is crucial to understand how much you savings in energy and carbon emissions you gain.

To provide insights and execute net-gain analysis we provide an extension to the Green Metrics Tool called [CarbonDB](https://www.green-coding.io/projects/carbondb/).

In essence it is an aggregate dashboard that gathers all energy and carbon data from our tools that submit their data to the GMT API.

In the *CarbonDB Dashboard* you can find:
- CI/CD energy and carbon data from Eco-CI
- Benchmarking energy and carbon data from Green Metrics Tool runs
- Developer machine energy and carbon data from PowerHOG
- Custom energy and carbon data from [CarbonDB Agents](https://github.com/green-coding-solutions/carbondb-agent) configured 
    - A typical setup for instance is to install a [CarbonDB Agent](https://github.com/green-coding-solutions/carbondb-agent) on the database server as well as the Frontend / Dashboard server
