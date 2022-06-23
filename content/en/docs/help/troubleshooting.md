---
title: "Troubleshooting"
description: "Solutions to common problems."
lead: "Solutions to common problems."
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu: 
  docs:
    parent: "help"
weight: 620
toc: true
---

## Browser cannot open Green Metrics Tool Frontend / ERR_CONNECTION_REFUSED

When you are getting an unexpected result when accessing localhost / \*.local domain or a different website gets served / 404 / 403 check:

- Caching problem, please open Developer tools in your browser and check the *Disable Cache* option under *Network*
- Not having set the hostname correctly in `/etc/hosts` for development:
- Not accessing the Green Metrics Tool with the additional supplied port: `http://metrics.green-coding.local:8000`

```
127.0.0.1 metrics.green-coding.local api.green-coding.local
```
- It could be that you have other containers running and the port is overloaded, so that some
other service serves content on that port. Check your `docker ps -a`
- Also check `lsof -i | grep PORTNUMBER` to look if something on your host OS is serving content on that port

## ERR_NAME_NOT_RESOLVED / DNS_PROBE_POSSIBLE
- Hostname of container correct? `docker ps` tells you the container name, which is also the hostname
- Are the containers on the same network? Check with `docker inspect CONTAINER_ID`
- Can access the container through browser when mapping the ports to the host OS? (See also debug mode for this)
-
## Debug mode
- Add the `--debug True` switches to your local calls to the `runner.py` to enter the stepping debug mode of the tool.
- Add "portmapping" to your usage_scenario.json to access containers through web interface for debugging

## General tips
- Always check container logs with `docker compose logs`. Sometimes streaming logs
does not work that well when orchestrating multiple containers and polling the directly gives you all logs.