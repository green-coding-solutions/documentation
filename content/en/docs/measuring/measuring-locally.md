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

Once you have the tool either installed through the Dockerfiles or directly on your machine you can access the
web interface through: http://metrics.green-coding.local:8000

## Important note on usage

If have opted for the Dockerfiles Installation and want to use the manual mode or cron mode of the `runner.py`
you must make a copy of the `tools` directory of this repository as well as create a `config.yml` file.

These must be run outside of the Docker containers, because otherwise you would run into a "Docker inside Docker" case, which has caveats.\
So here please create a new directory, copy the `config.yml.example` and rename it to `config.yml` and populate it with the connection details
of the database from the Docker container which you have seen in [Dockerfiles method](https://github.com/green-coding-berlin/green-metrics-tool/tree/main/Docker).\

Then copy `tools` directory also into that folder.


## Cron mode

If you have installed a cronjob you can insert a new job at http://metrics.green-coding.local:8000/request.html

<p align="center">
  <img src="images/demo-submit-form.png" width="50%" title="Cron mode job insertion for green metrics tool">
</p>
>  Cron mode job insertion for green metrics tool


It will be automatically picked up and you will get sent an email with the link to the results.

In order for the email to work correctly you must set the configuration in your used `config.yml`, either
on your Host OS or in your Docker containers depending on the installation mode you choose.

## Manual mode

If have opted for the Manual Installation and want to use the manual mode of the `runner.py`
just go  `tools` folder.

Now you can use the `runner.py` tool to trigger a run of the tool manually.
\
\
An example call would be like so: `runner.py manual --folder /path/to/my_demo_software --name My_Name`

The tool expects a `usage_scenario.json` inside of that folder. It will read it, orchestrate the containers
and give you the ID of the run.

If you have questions regarding how to create a `usage_scenario.json` please see: https://github.com/green-coding-berlin/green-metric-demo-software

To see a working live example with some metrics go to: https://metrics.green-coding.org/


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