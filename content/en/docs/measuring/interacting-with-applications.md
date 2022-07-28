---
title : "Interacting with applications"
description: "Interacting with applications"
lead: ""
date: 2022-06-18T08:48:45+00:00
draft: false
images: []
---


Content: 
- How to write a flow
- What a flow access
- 
We will here guide you through the concept of interacting with the containers
through the Green Metrics Tool.

We provide an example for a terminal application, as well as for a web application.

The result will be a `usage_scenario.yml` file. ([Specification →]({{< relref "usage-scenario" >}}))

## Command line app

TODO

```yaml
flow:
  - name: Check Website
    container: green-coding-puppeteer-container
    commands:
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Pupeteer Flow
        read-notes-stdout: true
      - type: console
        command: sleep 30
        note: Idling
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Pupeteer Flow again
        read-notes-stdout: true
```

## Web app
```yaml
flow:
  - name: Check Website
    container: green-coding-puppeteer-container
    commands:
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Pupeteer Flow
        read-notes-stdout: true
      - type: console
        command: sleep 30
        note: Idling
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Pupeteer Flow again
        read-notes-stdout: true
```

If you came here from the [Containerizing Applications →]({{< relref "containerizing-applications" >}}) Tutorial
please check a full version for the last example at our [Example app repository](https://github.com/green-coding-berlin/example-applications/tree/main/wordpress-mariadb-data)