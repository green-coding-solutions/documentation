---
title: "Philosophy & Methodology"
description: "How we approach the measurement of softwares energy use."
lead: "How we approach the measurement of softwares energy use."
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu:
  docs:
    parent: "prologue"
weight: 110
toc: true
---

We believe in the containerization of applications.
The benefit are that the overhead is extremely small and
it gives the benefit of controlling the execution and also the interfaceing with the
environment around it.

Most modern applications are already containerized or can be easily brought into this format (At least for the purpose of measuring).

Therefore the Green Metrics Tool is designed to only measure containerized applications.

## Honorable mentions, Differences and USPs

The Green Metrics Tool boroughs the concept of *Standard Usage Scenarios* from the [Blauer Engel](https://www.blauer-engel.de/en/productworld/resources-and-energy-efficient-software-products) / [KDE Team](https://eco.kde.org).
We also believe that they provide the best approach to understand how an application
would typically behave under real-world usecases.

Therefore we create every measurement by providing the architecture of the software and the flow
that the software shall execute in such a [usage_scenario.json →]({{< relref "usage-scenario" >}}) file.

The difference here is that we focus on application architectures which are modular / distributed
and provide a more wholistic apporoach in also delivering and Open Data API and Web Frontend to display the metrics in charts.

### Greenframe.io
Our tool is also inspired by [Greenframe.io](https://www.greenframe.io) with the difference of the code
being fully free and open-source (FOSS), all data generated as Open Data and supporting terminal applications like
ML / AI tools and also plans to support Desktop applications.

Also the formulas for measurement are fully visible and to be falsified by anyone, which is not the case for Greenframe.io as they
use a proprietetary calculation model.

### Scaphandre and per-process measurement
We also believe that per-process measurement is not the way to go to get a qualitative view of a whole application
as the boundaries should be drawn on the container level which provide the logical abstraction level.

{{< alert icon="👉" text="If you however have these needs to measure processese please check out <a href='https://github.com/hubblo-org/scaphandre'>Scaphandre</a> which does a better job on this use-case than our tool." />}}


## Architecture & Technology

We rely on the `container` specification that is mainly implemented by [Docker](https://www.docker.com/)

We orchestrate the containers in your application to get a local representation of your architecture
and then connect to every container to measure its energy use and performance metrics.

### UNIX style of Metric Reporters

To measure the containers we rely on the concept of *Metric Reporters*.
These are small UNIX-style programs that typically reporty only one metric directly to STDOUT.

This keeps the profile of the measurement extremly low and makes the *Metric Reporters* versatily and reuasable.

### Reusability of Infrastructure as Code

We want to reuse infrastructure files as best as possible.

Therefore our tools consumes ready-built containers and can will also be able to consume Kubernetes
infrastructure files.

In the setup part of our [usage_scenario.json →]({{< relref "usage-scenario" >}}) you can however provide
additional options to run the container, which are very helpful in terms of reusing other peoples containers.
For instance you can run an `apt install` to install one missing tool in a standard `ubuntu` container without
having the need to create a new image on DockerHub.

However we cannot allow the full options of `docker compose` as this would allow to mount arbitrary volumes
on our measurement machines or even run in `--priviledged` mode.

## Energy measurement

To measure the container we use a *Metrics Reporter* that queries the Energy Registers
of modern processors.

The interface is typically called *RAPL* (Running average power limit) and was introduced by Intel.

To falsify these measurements we also provide the option to get the DC and AC power readings from our
measurement machines for you.

## Reproducibility & Open Data

To make people energy aware when using and creating software we believe that it is essential to have
every measurement open and visible.

Also the tools to measure must be free and open-source (FOSS).

To however compare one measurement with another we believe that you cannot change the underlying hardware.

Therefore we provide a central repository for all the measurements we make: [Green Metrics Frontend](https://metrics.green-coding.org)
