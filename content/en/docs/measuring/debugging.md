---
title: "Debugging the measurement workflow"
description: "Debugging the measurement workflow"
lead: ""
date: 2022-06-03T08:48:45+00:00
draft: false
images: []
---

The first step in debugging a measurement workflow is to turn the `--debug`
flag of the Testrunner on.

When you make your call to the `runner.py` when you measure locally
it will turn into a stepable mode where you contine to the next step by pressing
enter.

You can then enter one of the containers to see if the required services are
running correctly.

An example call would be:
```bash
docker exec -it MY_CONTAINER_NAME bash
```

Some container do not have `bash`. However `sh`, which has less capabilities though,
should in most cases be available.