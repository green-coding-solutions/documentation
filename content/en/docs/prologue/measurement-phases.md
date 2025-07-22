---
title: "Measurement Phases"
description: "Measurement phases of the Green Metrics Tool"
date: 2023-05-04T08:49:15+00:00
weight: 104
toc: true
---

In the current version of the Green Metrics Tool we changed our  
measurement approach from just containing the data for the runtime of the software  
to also look at other stages of the lifecycle of software.

Software has not only to be run, it also has to be  
developed, tested, installed, booted and removed.

The Green Metrics Tool currently supports the following phases:

- Baseline
- Installation
- Boot
- Idle
- Runtime
- Remove

<img class="ui centered rounded bordered" src="/img/overview/green_metrics_dashboard.webp" alt="Measurement phases overview">

These phases originate from the idea to look at software from a lifecycle perspective,  
similar to how [ISO 14001](https://www.iso.org/iso-14001-environmental-management.html) and also the [Blue Angel](https://www.blauer-engel.de/en/productworld/resources-and-energy-efficient-software-products) for software does.

## Baseline

Measures the system with metric providers enabled, but without the application.  
The purpose of this phase is to get a familiarity with the load on the system  
when no application is running.

## Installation

The images specified in the `usage-scenario.yml` file are pulled  
or built from local `Dockerfiles`.  
The building of Docker images happens within a container running [Kaniko](https://github.com/GoogleContainerTools/kaniko).  

## Boot

The images built in the previous phase are orchestrated and the application is started.

## Idle

The application is now running and waiting to start running flows.  
Complementary to the baseline phase, we measure the load  
on the system when the application is running.

## Runtime

This is the phase where the flows that were specified as part of  
the `usage-scenario.yml` are run within the orchestrated application.

## Remove

In this phase the application architecture is being taken down  
and metric providers are being stopped.  
The system returns back to baseline and the measurement process is finished.
