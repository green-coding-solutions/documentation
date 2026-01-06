---
title: "Green Metrics Tool Framework"
description: "Contributing to the Green Metrics Tool"
date: 2022-06-10T09:49:15+00:00
weight: 802
toc: false
---

## We are very happy to accept any contributions to the framework! 🥳🎉😍

Please send all pull requests to our [`main` branch](https://github.com/green-coding-solutions/green-metrics-tool/tree/main).

If you want to develop a bigger feature or alter core functionalities please have a look in the [Design Guidelines](#design-guidelines) to make your self familiar where which functionality in the tool currently lives and how new features can be added best.

If you have any questions to not hesitate to send us an email: [info@green-coding.io](mailto:info@green-coding.io)

## Design Guidelines

### Configuration Hierarchy

The GMT has **a lot** of configuration options. Which is quite typical for any benchmarking / measurement suite.

We took quite some care to put the configuration options in *domains* that hopefully make it better to understand where to expect which option and where to add new options best:

#### **config.yml**

This file lives on measurement machine / cluster server (DB and Dashboard). Since measurement machines and the cluster server are the same box in development some options are not used on either machine in a production setup.

Here you find:

- Configuration data for SMTP / Database / Redis / Email sending / Error logging etc.
- Metric Provider configuration which are available on the machine
- Name, Temperatur Baseline, host_reserved_cpus etc. of a machine
- SCI configurations which are unique to the machine itself

## usage_scenario.yml

This file lives in the repository of the *to-be* measured software. Typically for every part of a functionality or every part of changed software infrastructure there is a separate *usage_scenario.yml* file.

Here you find:

- The required software infrastructure to run a measurement of the software (containers / linked repos etc.)
- The steps that shall be executed in order to test a certain functionality (the *flow*)
- Some small meta data like a name, the creator of the file etc.

## Run

The run is what is created when a new measurement with the GMT shall be done.
Either via the web submit form or directly via the `/vX/software/add` endpoint.

Here dynamic data shall be submitted that is NOT unique to the machine and is also not part of the software infrastructure or executed flow. It contains information about which software to benchmark and how to dynamically alter the measurement.

Here you find:

- Static information of the software like URL of the repository, filename of the *usage_scenario.yml* (if different), branch etc.
- GMT-Vars that dynamically inject content into the otherwise static *usage_scenario.yml* file (for instance if you do not want to have 20 *usage_scenario.yml* files for 10 different node versions that you would like to compare)
- (future): Tweaks to the otherwise static machine (like setting kernel boot parameters, turning TurboBoost off etc.) or the outside world (like mocking certain real world API endpoints, providing carbon intensity data to run via environment variables etc.)

## New metrics

Metrics should always be added through a new metrics provider.

A metric provider should always have:

- **metric-provider-binary** - A binary or script that captures metrics from somewhere in the host system (for instance procfs for CPU utilization)
  - This file should **always** work standalone and not require a running GMT. Very often this is a native compiled C files.
  - See also the `libs/c` directory for some convenience library files that ship with GMT.
- **provider.py** - File containing Python class derived from *BaseMetricProvider* which implements how data is ingested into GMT
- **README.md** - An info file specifying what is the ouput of the metric provider in terms of unit and dimension as well as how to execute it on a CLI and what arguments exist.

The new metric provider is the integrated in two locations:

- **config.yml** - Here is just the name required. All other parameters will be passed to the provider class init function and can then also be passed along to the CLI binary / script
- **lib/phase_stats.py** - Here the aggregation of the raw metrics is defined. For instance if you want the values summed, aggregated or similar. There are different categories already pre-defined and it should often only be needed to add the name of your provider to one of the if-clauses.
- **frontend/js/helpers/config.js.example** (optinal): Here you can set a nice name for the Dashboard for displaying the metric provider data.

## Jobs

GMT has a native Jobs system that will prune stale jobs and also make sure no two same jobs from a category can run at the same time (locking).

Adding jobs is done by creating a new child class in `lib/job`. You need to give it a unique name and overload functions from the base class as you see fit. Finally you need to register a cronjob for it to trigger this new *category* of jobs.

### Cronjobs

Cronjobs always ingest a separate config file called `manager-config.yml` which lives in the root of the GMT. This file should contain only the DB credentials which are typically different from the cluster server ones to provide security isolation with different permissions of the user.

The cronjobs are typically *spaghetti code* (in a nice way, we promise! :) ) and execute a custom functionality. Typical things are:

- Backfilling carbon data
- Compressing and de-duplicating CarbonDB
- etc.

It is the easiest and also the only way to add back-office functionality to the GMT which is not specific to a run or API request.

## Core functionality

- All API code lives in /api and is typically divided by functionality. Every tool of the suite (Eco CI, ScenarioRunner etc.) has it's own file.
- Optimizations live under optimizations. Look at the example file to create a new one. It will be automatically loaded
