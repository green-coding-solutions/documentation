---
title: "Debugging measurements"
description: "Debugging measurements"
lead: ""
date: 2022-06-15T08:48:45+00:00
draft: false
images: []
---

The first step in debugging a measurement workflow is to turn the `--debug`
flag of the `runner.py` on.

When you call the `runner.py` locally it will turn into a steppable mode where 
you contine to the next step by pressing enter.

You can then enter one of the containers to see if the required services are
running correctly.

An example call would be:
```bash
docker exec -it MY_CONTAINER_NAME bash
```

Some container do not have `bash`. However `sh`, which has less capabilities though,
should in most cases be available.

## Adding unsafe mode

The `--unsafe` flag of the `runner.py` allows for:
- Portmapping exposed ports from the container to the host OS
    + This is helpful if you for example have a webservice container or API and would like to check with the browser if the container is correctly orchestrated
- Allows arbitrary volume mounts
    + On our hosted service volume mounts are blocked due to security concerns. In local mode however you can bind shared volumes to the containers