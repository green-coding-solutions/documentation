---
title: "Troubleshooting"
description: "Solutions to common problems."
lead: "Solutions to common problems."
date: 2020-11-12T15:22:20+01:00
lastmod: 2020-11-12T15:22:20+01:00
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