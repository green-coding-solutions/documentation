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

- Not accessing the Green Metrics Tool with the additional supplied port: `http://metrics.green-coding.local:8000`
- Caching problem, please open Developer tools in your browser and check the *Disable Cache* option under *Network*
- Not having set the hostname correctly in `/etc/hosts` for development:
```
127.0.0.1 metrics.green-coding.local api.green-coding.local
```

## ERR_NAME_NOT_RESOLVED / DNS_PROBE_POSSIBLE
TODO
When this error occurs while trying to connecto to a container ....


Hostname of container correct? Same network?

Cann access through browser?

## Debug mode
TODO
- Add "portmapping" to your usage_scenario.json to access containers through web interface for debugging