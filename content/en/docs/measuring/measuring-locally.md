---
title : "Measuring locally"
description: "Measuring locally with the runner.py"
lead: ""
date: 2022-06-05T08:48:45+00:00
draft: false
images: []
---

Before starting to measure you must first install some prerequisites: [Installation →]({{< relref "installation-overview" >}})

## Runner.py Documentation

TODO

Typical call: `python3 runner.py manual --folder FOLDER --name NAME`

## Cron mode

TODO

## Commandline options

### Debug mode
Append the `--debug` flag to set a steppable mode of the Testrunner.

This allows you to enter the containers and debug them if necessary.

### Unsafe mode
Append the `--unsafe` flag to allow:
- Arbitrary volume bindings into the containers. They are still read-only though
- Portmappings to the host OS. 
    + See [usage_scenario.json →]({{< relref "usage-scenario" >}}) **portmappings** option for details
- Non-Strict ENV vars mapped into container
     + See [usage_scenario.json →]({{< relref "usage-scenario" >}}) **env** option for details

## No File Cleanup
Append `--no-file-cleanup` to keep the metric provider data in `/tmp/green-metrics-tool`