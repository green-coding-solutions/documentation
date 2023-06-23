---
title: "Philosophy & Methodology"
description: "How we approach the measurement of softwares energy use."
lead: "How we approach the measurement of software energy use."
date: 2022-06-15T08:49:15+00:00
weight: 1002
toc: true
---

Our system is designed to raise awareness and educate about  
the energy use of software in typical off-the-shelf systems.

It gives you the capability to iterate and optimize your software's  
energy consumption on a fixed hardware setup.

The result is that you get an idea of the order of magnitude of the energy  
your software is consuming, also enabling you to make comparisons  
on exact numbers as the software develops and changes over time.

When running on different hardware setups, an order of magnitude comparison is  
helpful in judging the best system for a particular software.

## Containerization

We believe in the containerization of applications.

The benefits are that the overhead is extremely small and it allows  
for control of the execution, interfacing, and environment around the application.

Most modern applications are already containerized or can be easily brought  
into this format (at least for the purpose of measuring).

Therefore, the Green Metrics Tool is primarily designed to  
measure containerized applications and software.

## Architecture & Technology

We rely on the container specification that is most dominantly implemented by [Docker](https://www.docker.com/)

We orchestrate the containers in your application to get a local representation of your architecture
and then get runtime metrics from every container to measure its energy use and performance metrics.

Some metrics that are not available on a container level, like CPU energy or DRAM energy are
retrieved on a system level and optionally attributed to a level of container granularity.

### UNIX style of Metric Reporters

To measure the containers we rely on the concept of *Metric Reporters*.
These are small UNIX-style programs that typically reports only one metric directly to STDOUT.

This keeps the profile of the measurement extremely low and makes the *Metric Reporters* versatile and reusable.

We support many different varieties of reporters like:

- Memory per Container
- CPU % per Container
- CPU Time per Container
- Network Traffic per Container
- CPU Frequency
- CPU Temperature
- Fan speed
- DC Energy of System
- AC Energy of System

### Reusability of Infrastructure as Code

We want to reuse infrastructure files as best as possible.

Therefore our tools consumes ready-built containers and will also be able  
to consume Kubernetes infrastructure files.

The format of the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) is based of the `docker-compose.yml`  
specification but does provide additional options to run the container, which are  
very helpful in terms of reusing other peoples containers.

For instance, you can run an `apt install` command to install one missing tool in a  
standard `ubuntu` container without having the need to create a new image on DockerHub.

However we do not allow the full options of `docker compose` as this would allow to  
mount arbitrary volumes on our measurement machines or even run in `--privileged` mode.

## Reproducibility & Open Data

To make people energy aware whilst using and creating software we believe that  
it is essential to have every measurement open and visible.

The tools used to make these measurements must also be free and open-source (FOSS).

However, we believe that energy comparisons between software running on different  
hardware setups is not totally feasible. All measurements should be compared only  
for the exact same machine, not even machines with identical components.

Therefore we provide a central repository for all the measurements we make to  
compare measurements on prepared fixed machine we provide: [Green Metrics Frontend](https://metrics.green-coding.berlin)

## Honorable mentions, Differences, and USPs

The Green Metrics Tool borrows the concept of  
*Standard Usage Scenarios* from the [Blauer Engel](https://www.blauer-engel.de/en/productworld/resources-and-energy-efficient-software-products) / [KDE Team](https://eco.kde.org).  

We also believe that they provide the best approach to understand how an application  
would typically behave under real-world usecases.

Therefore we create every measurement by providing the architecture of the software  
and the flow that the software shall execute in such a [usage_scenario.yml →]({{< relref "usage-scenario" >}}) file.

The difference is that we focus on application architectures that are modular or distributed.  
We also provide a more holistic approach by also delivering an Open Data API and  
Web Frontend to display the metrics in charts.

### Greenframe.io

Our tool is also inspired by [Greenframe.io](https://www.greenframe.io) with the difference  
that the code is fully free and open-source (FOSS).

All data generated as Open Data and supporting terminal applications like  
ML / AI tools and also plans to support Desktop applications.

Also the formulas for measurement are fully visible and to be falsified by anyone,  
which is not the case for Greenframe.io as they use a proprietary calculation model.

### Scaphandre and per-process measurement

Scaphandre is one of the major open source tools currently available to measure  
the energy consumption of software.

We however believe that for the job of pure energy measurement it is too complex  
in terms of the size of the tool. Having smaller reporters that only spit out one metric  
and can be technically used everywhere inline is the better way to go.

Also that Scaphandre does not handle the reproducible orchestration part to  
falsify the measurements is not the approach we believe is best to go.

Therefore we decided to pursue a different path with our tool and not reuse Scaphandre.

{{< alert icon="👉" text="If you however have more the need for observability and measuring on a process level please check out <a href='https://github.com/hubblo-org/scaphandre'>Scaphandre</a> which may fit your needs better than our tool." />}}
