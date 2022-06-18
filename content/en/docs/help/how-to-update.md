---
title: "How to Update"
description: "Regularly pull the repository / rebuild the containers"
lead: "Regularly pull the repository / rebuild the containers"
date: 2020-11-12T13:26:54+01:00
lastmod: 2020-11-12T13:26:54+01:00
draft: false
images: []
menu:
  docs:
    parent: "help"
weight: 610
toc: false
---


## Regularly pull the repository / rebuild the containers

If you run the containers without overlaying your local filesystem they will not pick up changes by themselves.

- If you overlay the filesystem you will have to restart the containers to pick up all changes (gunicorn caches the python files).
- If you do not overlay your local filesystem you have to rebuild the containers

{{< alert icon="💡" text="You can also go inside the container and check out the github repository manually and then restart the container, but we discourage this approach, as it would not pick up changes to the server configuration itself." />}}


## Read our development blog

We will soon start our development blog. Stay tuned for more infos / links to this one ...