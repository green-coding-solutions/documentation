---
title: "How to Update"
description: "Regularly pull the repository / rebuild the containers"
lead: "Regularly pull the repository / rebuild the containers"
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu:
  docs:
    parent: "help"
weight: 610
toc: true
---


## Regularly pull the repository / rebuild the containers

If you run the containers without overlaying your local filesystem they will not pick up changes by themselves.

- If you overlay the filesystem you will have to restart the containers to pick up all changes (gunicorn caches the python files).
- If you do not overlay your local filesystem you have to rebuild the containers

{{< alert icon="💡" text="You can also go inside the container and check out the github repository manually and then restart the container, but we discourage this approach, as it would not pick up changes to the server configuration itself." />}}


## Read our company blog

If we introduce breaking changes or release new major versions we will post it there: [Company Blog](https://www.green-coding.org/blog)

