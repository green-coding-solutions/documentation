---
title: "Debugging measurements"
description: "Debugging measurements"
lead: ""
date: 2022-06-15T08:48:45+00:00
weight: 840
---

## Debugging containers

The GMT offers two approaches to debugging that can be used
separately or in conjunction

### --dev flags
The first approach is to use the `--dev-*` switches as defined in the [runner switches →]({{< relref "/docs/measuring/runner-switches" >}}).

Here you can turn on many switches that speed up a run. Please note that no useful measurement
will come out of the tool. These flags should only be used when debugging.

Especially the `--dev-flow-timetravel` is extremely useful as it will let you retry a step in 
the *usage scenario* without having to go through all previous steps. It will also keep the container state so that if you can do live edits to the files in your local filesystem that are mounted then writeable into the container.
Please note that this only works with a local repository. If your repository is online only atm clone it first to your local filesystem. This allows for editing files while running a *usage scenario*

A typical call looks like this:
`python3 --uri MY_LOCAL_PATH --name Testing --allow-unsafe --dev-no-metrics --dev-no-sleeps --dev-cache-build --dev-flow-timetravel`

### --debug flag
The second approach in debugging a *usage_scenario* is to  
turn the `--debug` flag of the `runner.py` on.

When you call the `runner.py` locally it will turn into  
a steppable mode where you continue to the next step by pressing enter.

You can then enter one of the containers to see if  
the required services are running correctly.

An example call would be:

```bash
docker exec -it MY_CONTAINER_NAME bash
```

Some container do not have `bash`. However `sh`, which has less capabilities,  
should be available in most cases.

### --print-logs

If your container fails to boot in the GMT many of the prior mentioned debugging flags do not help.

Since this is usually related to a problem in the `Dockerfile` you can show the output of the docker build client
by adding `--print-logs`

## Debugging containers via HTTP / exposed ports

If entering the container looks fine and you need to access them through some of their  
exposed ports (ex. via Browser through HTTP) turn on the `--allow-unsafe` flag to bind  
the ports specified in the `usage_scenario.yml`.

## Debugging metric providers

To see if the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) are working correctly you have two options:

- Start them manually from their respective folder under `/metric-providers/...` and look if the output is as expected
- Turn on the `--no-file-cleanup` switch to see if the files generated in `/tmp/green-metrics-tool/[...].log` are in expected format
