---
title: "Debugging measurements"
description: "Debugging measurements"
date: 2022-06-15T08:48:45+00:00
weight: 460
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

## Debug flow commands

Be sure to activate:
```docker
log-stderr: true
log-stdout: true
```
on the flow commands to debug them.

## Debugging containers via HTTP / exposed ports

If entering the container looks fine and you need to access them through some of their
exposed ports (ex. via Browser through HTTP) turn on the `--allow-unsafe` flag to bind
the ports specified in the `usage_scenario.yml`.

## Debugging metric providers

To see if the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) are working correctly you have two options:

- Start them manually from their respective folder under `/metric-providers/...` and look if the output is as expected
- Check the  `/tmp/green-metrics-tool/[...].log` files, after a run to see if there is some data being reported

## Debugging flow commands not ending

This is a tricky problem as it might be "intended" behaviour.
Typically when a *flow command* does not end it is because the process is really working endlessly (daemon) or the process ran into some kind of deadlock (mutex locks, OOM etc.).

We recommend you check if the container ran into configured memory / cpu limits of the docker orchestrator. Either through linux system tools or through *docker stats* if you have system access.

If you are using the **GMT Cluster / SaaS** you can let the process run into the maximum time limit to see the metrics timelines to understand memory and CPU usage and possible limits hit.
>>>>>>> main
