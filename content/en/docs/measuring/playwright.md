---
title: "Playwright Command"
description: "Specification for using Playwright inside a usage_scenario.yml"
date: 2025-10-01
weight: 420
---

The Green Metrics Tool supports **Playwright** as a first-class command type in the `usage_scenario.yml`.  
[Playwright](https://playwright.dev/) is a popular framework for end-to-end browser automation. With this integration, you can run browser-based user journeys directly inside your usage scenarios without maintaining a separate Playwright script file.  

---

## Simplified Setup with GMT Helper

Getting started with Playwright is easy using the `!include-gmt-helper`. By including `gmt-playwright-v1.0.0.yml`, the Green Metrics Tool automatically:

1.  Configures the Playwright service container (`gmt-playwright-nodejs`) with the official Microsoft Playwright image.
2.  Installs all necessary Playwright libraries.
3.  Starts the Playwright browser and an IPC listener in the background.

To get started, add the following to your `usage_scenario.yml`:

```yaml
!include-gmt-helper: gmt-playwright-v1.0.0.yml

# Your flow can now use the gmt-playwright-nodejs container
flow:
  - name: "Go to home page"
    container: gmt-playwright-nodejs
    commands:
      - type: playwright
        command: await page.goto("https://green-coding.io")
      - type: console
        command: sleep 5
```

This helper significantly simplifies your workflow by handling the setup for you.

---

## Defining Playwright Commands

As shown above, you can define steps of type `playwright` in your flow.

- `type: playwright`  
  Defines a Playwright step instead of a shell command.  
- `container: gmt-playwright-nodejs`  
  This must match the container provided by the GMT Playwright helper.
- `command:` **[str]**  
  A JavaScript/TypeScript snippet that is executed via Playwright inside the container.

This allows you to inline browser interactions alongside other commands for fine-grained measurement.  

---

## Caching with a Reverse Proxy

For scenarios where you want to cache browser requests to minimize network variability, use the `gmt-playwright-with-cache-v1.0.0.yml` helper. It sets up an additional `squid` reverse proxy service and configures Playwright to use it.

```yaml
!include-gmt-helper: gmt-playwright-with-cache-v1.0.0.yml

flow:
  - name: "Go to home page with cache"
    container: gmt-playwright-nodejs
    commands:
      - type: playwright
        command: await page.goto("https://green-coding.io")
```

---

## Full Example

Here is a complete `usage_scenario.yml` that measures the homepage of `green-coding.io`:

```yaml
!include-gmt-helper: gmt-playwright-v1.0.0.yml

name: "Measure homepage of green-coding.io"
description: "A simple example that measures the energy consumption of a website's homepage."

flow:
  - name: "Navigate to green-coding.io"
    container: gmt-playwright-nodejs
    commands:
      - type: playwright
        command: await page.goto("https://green-coding.io")
        note: "Navigate to the website"
      - type: console
        command: sleep 10
        note: "Wait for 10 seconds to allow for idle load"

  - name: "Take a screenshot"
    container: gmt-playwright-nodejs
    commands:
      - type: playwright
        command: await page.screenshot({ path: '/tmp/repo/screenshot.png' })
        note: "Take a screenshot to verify the page loaded"
```

---


## See also:  
- [usage_scenario.yml Specification →](/docs/measuring/usage-scenario/)  
- [Variables →](/docs/measuring/usage-scenario/#variables)
