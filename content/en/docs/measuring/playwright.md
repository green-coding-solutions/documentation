---
title: "Playwright Command"
description: "Specification for using Playwright inside a usage_scenario.yml"
date: 2025-10-01
weight: 420
---

The Green Metrics Tool supports **Playwright** as a first-class command type in the `usage_scenario.yml`.  
[Playwright](https://playwright.dev/) is a popular framework for end-to-end browser automation. With this integration, you can run browser-based user journeys directly inside your usage scenarios without maintaining a separate Playwright script file.  

---

## Defining Playwright Commands

In addition to `console` commands, you can define steps of type `playwright`.  

Example:

```yaml
flow:
  - name: "Go to home page simple"
    container: gcb-playwright
    commands:
      - type: playwright
        command: await page.goto("https://green-coding.io")
      - type: console
        command: sleep 5
```

- `type: playwright`  
  Defines a Playwright step instead of a shell command.  
- `command:` **[str]**  
  A JavaScript/TypeScript snippet that is executed via Playwright inside the container.

This allows you to inline browser interactions alongside other commands for fine-grained measurement.  

---

## Container Setup

Playwright requires a container with the Playwright runtime installed. You can either install Playwright in your own container or use the [official Microsoft Playwright container](https://mcr.microsoft.com/en-us/product/playwright/about).  

Example:

```yaml
services:
  gcb-playwright:
    image: mcr.microsoft.com/playwright:v1.55.0-noble
#    volumes:
#       - /tmp/.X11-unix:/tmp/.X11-unix # for debugging in non-headless mode
#    environment:
#      DISPLAY: ":0" # for debugging in non-headless mode
    setup-commands:
        # install playwright libraries
      - command: mkdir /tmp/something
      - command: cp -R /tmp/repo/. /tmp/something
      - command: cd /tmp/something && npm init -y && npm install playwright # You can select the browser here if you only want one
        shell: bash
```

---

## Running the Playwright IPC Listener

Internally, Playwright commands are executed through an **inter-process communication (IPC) listener** that the Green Metrics Tool connects to.  
You need to start this listener in your container before running Playwright steps.  

Example:

```yaml
flow:
  - name: "Start Playwright"
    container: gcb-playwright
    commands:
      - type: console
        command: node /tmp/something/playwright-ipc.js --browser firefox
        note: Starting browser in background process with IPC
        detach: true
      - type: console
        command: until [ -p "/tmp/playwright-ipc-ready" ]; do sleep 1; done && echo "Browser ready!"
        shell: bash
        note: Waiting for browser IPC listener to be ready
```

- The IPC script is available [here](https://raw.githubusercontent.com/green-coding-solutions/branch-magazine-energy-tests/refs/heads/main/playwright-ipc.js).  
- The rendezvous file `/tmp/playwright-ipc-ready` is used as a readiness indicator.  

---

## Full Example

You can find a complete `usage_scenario.yml` example here:  
[Branch Magazine energy tests – usage_scenario_default_homepage.yml](https://github.com/green-coding-solutions/branch-magazine-energy-tests/blob/main/usage_scenario_default_homepage.yml)  

---


## See also:  
- [usage_scenario.yml Specification →](/docs/measuring/usage-scenario/)  
- [Variables →](/docs/measuring/usage-scenario/#variables)  
- [Branch Magazine Energy Tests](https://github.com/green-coding-solutions/branch-magazine-energy-tests/tree/main)  
