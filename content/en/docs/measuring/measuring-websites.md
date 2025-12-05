---
title: "Measuring Websites"
description: ""
date: 2025-05-23T01:49:15+00:00
weight: 441
toc: true
---

GMT can also measure websites and takes a multi-dimensional approach here:

- The energy of the browser is measured to display and render the page
- The network transfer energy is measured that was needed to download the HTML and page assets

To isolate this as best as possible GMT orchestrates a reverse proxy, warms up the cache by pre-loading the full page once and only then does the final measurement.

**Warning:** Measuring websites is very tricky! GMT shaves off some of the caveats by using reverse proxys and cache pre-loading to make results more reliable. Since measurement load times are in milliseconds range you must have [Metric Providers]({{< relref "/docs/measuring/metric-providers/" >}}) with very high *sampling_rates* connected. **2ms** is a good value. Also website measurements are really only realiable in a [controlled cluster]({{< relref "/docs/cluster/" >}}) with [accuracy control]({{< relref "/docs/cluster/accuracy-control" >}}).

## Quick website measuring

Since measuring websites is so common GMT comes with a quick measurement function for that.

In the root folder you find the `run-template.sh` file.

Measure a sample query like this: `bash run-template.sh website "https://www.green-coding.io"`

It will download the needed containers, setup them up and run the measurement. Once you got this quick measurement running iterate on it by extending the [example measurement file](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/templates/website/usage_scenario.yml) with more steps, for instance measuring all the sub-pages on your domain

Bonus tip: If you apply `--quick` to the `run-template.sh` call the measurement is quicker for debugging purposes. However results will be not as reliable. Use only for debugging!

## Trying out our hosted service

We operate [website-tester.green-coding.io](https://website-tester.green-coding.io) as a simple demo vertical that uses the underlying [Green Metrics Tool Cluster Hosted Service →]({{< relref "/docs/measuring/measuring-service" >}}).

Check it out if you do not feel like installing the GMT and just want to get carbon and energy info on a single page.

## Crafting your own flows with Playwright commands

The Green Metrics Tool supports **Playwright** as a first-class command type in the `usage_scenario.yml`.  
[Playwright](https://playwright.dev/) is a popular framework for end-to-end browser automation. With this integration, you can run browser-based user journeys directly inside your usage scenarios without maintaining a separate Playwright script file.  

---

### Simplified Setup with GMT Helper

Getting started with Playwright is easy using the `!include-gmt-helper`. By including `gmt-playwright-v1.0.0.yml`, the Green Metrics Tool automatically:

1. Configures the Playwright service container (`gmt-playwright-nodejs`) with the official Microsoft Playwright image.
2. Installs all necessary Playwright libraries.
3. Starts the Playwright browser and an IPC listener in the background.

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

### Defining Playwright Commands

As shown above, you can define steps of type `playwright` in your flow.

- `type: playwright`  
  Defines a Playwright step instead of a shell command.  
- `container: gmt-playwright-nodejs`  
  This must match the container provided by the GMT Playwright helper.
- `command:` **[str]**  
  A JavaScript/TypeScript snippet that is executed via Playwright inside the container.

This allows you to inline browser interactions alongside other commands for fine-grained measurement.  

---

### Caching with a Reverse Proxy

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

### Full Example

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

- [usage_scenario.yml Specification →]({{< relref "/docs/measuring/usage-scenario/" >}})  
- [Variables →]({{< relref "/docs/measuring/usage-scenario/#variables" >}})
