---
title: "Debugging measurements"
description: "Debugging measurements"
lead: ""
date: 2022-06-15T08:48:45+00:00
weight: 809
---

## Debugging containers or runner.py itself

The first step in debugging a measurement workflow is to  
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

## Debugging containers via HTTP / exposed ports

If entering the container looks fine and you need to access them through some of their  
exposed ports (ex. via Browser through HTTP) turn on the `--allow-unsafe` flag to bind  
the ports specified in the `usage_scenario.yml`

## Debugging metric providers

To see if the [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}}) are working correctly you have two options:

- Start them manually from their respective folder under `/metric-providers/...` and look if the output is as expected
- Turn on the `--no-file-cleanup` switch to see if the files generated in `/tmp/green-metrics-tool/[...].log` are in expected format
