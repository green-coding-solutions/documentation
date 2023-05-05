---
title: "Measurement Phases"
description: "Measurement phases of the Green Metrics Tool"
date: 2023-05-04T08:49:15+00:00
weight: 1004
toc: true
---

The measurement process is divided into phases, intended to reflect the lifecycle of an application.

The phases are:

- Baseline
- Installation
- Boot
- Idle
- Runtime
- Remove

## Baseline

Measures the system with metric providers enabled, but without the application.
The purpose of this phase is to get a familiarity with the load on the system when no application is running.

## Installation

In this phase, the building of Docker images happens.
This is done within a container running [Kaniko](https://github.com/GoogleContainerTools/kaniko).
The images specified in the `usage-scenario.yml` file are pulled or built from local `Dockerfiles`.

## Boot

The images built in the previous phase are orchestrated and the application is started.

## Idle

The application is now running and waiting for user interaction.
Complementary to the baseline phase, we measure the load on the system when the application is running.

## Runtime

This is the phase where the flows that were specified as part of the `usage-scenario.yml` are run  
against the application.

## Remove

In this phase the application is being taken down and metric providers are being stopped.
The system returns back to baseline and the measurement process is concluded.
