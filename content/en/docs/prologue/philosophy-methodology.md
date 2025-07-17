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

### Granularity of energy data

Energy data by the current metrics reporters we support comes at different levels of granularity:

- Machine wide (MCP, IPMI etc.)
- Component wide (CPU, DRAM)

When optimizing an application it might be interesting to get the energy value per container and not only for the component that the whole machine is utilizing.
Such splittings can be theoretically done as for instance [Scaphandre](https://github.com/hubblo-org/scaphandre)
 can split a whole CPU energy signal by the CPU utilization (see also below for caveats). Other tools like 
 [Kepler](https://github.com/sustainable-computing-io/kepler) use for instance *CPU Instructions* to derive a per container or per process energy value.

 These values, although theoretically intriguing, have multiple caveats attached like for instance speculative execution, out of order execution, instable instruction counting etc. that make the non-exact and still only an approximation to what the process / container is actually in energy.

 Therefore we decided for the moment of not going the route of splitting the energy per container for the moment until a gold-standard has emerged that makes sense to use.
 Our philosphy is rather that if a machine is executing a piece of software everything on that box should be attributed to the energy cost of the software.

 Our Measurement Cluster uses dedicated machines so small that they represent a typical VM that you would also use in the cloud to give a realistic and comparable picture of what your software might also be using in a final cloud setup. Furthermore we will offer soon the support to for instance separate two logical and physical disjunct components onto two machines.

Example: You have a driver (JMeter, a Webbrowser, curl etc.) and an API. At the moment the GMT will orchestrate both of these on one machine. However we will soon support the functionality to provision both of these disjunct components on two separate machines to better reflect the cumulated energy cost that incurs when having two physical machines as it would be in a real world scenario.

We have a dicussion on if an implementation is useful here if you want to contribute and maybe have an implementation
of this functionality in the GMT in a future version: https://github.com/green-coding-solutions/green-metrics-tool/discussions/562



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

The format of the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}}) is based of the `docker-compose.yml`  
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
compare measurements on prepared fixed machine we provide: [Green Metrics Frontend](https://metrics.green-coding.io)

## Honorable mentions, Differences, and USPs

The Green Metrics Tool borrows the concept of  
*Standard Usage Scenarios* from the [Blauer Engel](https://www.blauer-engel.de/en/productworld/resources-and-energy-efficient-software-products) / [KDE Team](https://eco.kde.org).  

We also believe that they provide the best approach to understand how an application  
would typically behave under real-world use cases.

Therefore we create every measurement by providing the architecture of the software  
and the flow that the software shall execute in such a [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}}) file.

The difference is that we focus on application architectures that are modular or distributed.  
We also provide a more holistic approach by also delivering an Open Data API and  
Web Frontend to display the metrics in charts.

### Greenframe.io

Our tool is also inspired by [Greenframe.io](https://www.greenframe.io) from Marmelab.

They have, since we started developing our tool, also [open-sourced theirs on GitHub](https://marmelab.com/blog/2022/11/09/greenframe-open-source.html) and made their
[methodology public](https://github.com/marmelab/greenframe-cli/blob/main/src/model/README.md).

The visual and chart display of the results are only available through their SaaS product which they host on Greenframe.io.

### Scaphandre and per-process measurement

[Scaphandre](https://github.com/hubblo-org/scaphandre) is one of the major open source tools currently available to measure  
the energy consumption of software.

We however believe that for the job of pure energy measurement it is too complex  
in terms of the size of the tool. Having smaller reporters that only spit out one metric  
and can be technically used everywhere inline is the better way to go.

Also that [Scaphandre](https://github.com/hubblo-org/scaphandre) does not handle the reproducible orchestration part to  
falsify the measurements is not the approach we believe is best to go.

Therefore we decided to pursue a different path with our tool and not reuse [Scaphandre](https://github.com/hubblo-org/scaphandre).

{{< callout context="note" icon="outline/hand-finger-right" >}}
If you however have more the need for observability and measuring on a process level please check out <a href='https://github.com/hubblo-org/scaphandre'>Scaphandre</a> which may fit your needs better than our tool.
{{< /callout >}}

