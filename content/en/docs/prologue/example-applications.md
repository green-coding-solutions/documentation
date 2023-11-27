---
title : "Example applications"
description: "Example applications."
lead: ""
date: 2022-06-15T08:49:15+00:00
weight: 1005
---

## Structure

All of our example applications have the same structure:

```txt
.
├── usage_scenario.yml
├── Dockerfile
├── compose.yml
├── README.md
└── ...
```

- `usage_scenario.yml`
- `Dockerfile` is needed in order for you to reproducibly build the container that will be used later in the measurement.
- `compose.yml` is used for development / demo purposes if you want see what the application does in your terminal / browser / desktop, or optionally included as a file in the `usage_scenario.yml`
- *...* is either a file, a folder or missing.
  + It contains supplemental files that are needed to build the `Dockerfile` and / or to make a bind-volume for the `compose.yml` be missing /will be a file / will be a folder.

Please check out our [repository of example applications on GitHub](https://github.com/green-coding-berlin/example-applications)

## Demoing the example application (optional)

```bash
docker compose
```

See in the `README.md` where to view output if present and how to trigger the application.

If you just want to run a part of our example application or debug run:

```bash
docker compose run SERVICE bash
```

Replace **SERVICE** with the relevant service in the `compose.yml`

## Building the example application

```bash
docker build .
```

What you get is an image in your `docker images` that is used in the [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario" >}})

## Measuring the example applications

To run the measurements please refer to: [Measuring locally →]({{< relref "/docs/measuring/measuring-locally" >}})

## Containerizing and measuring own applications

Please refer to [Containerizing and measureing own applications →]({{< relref "/docs/measuring/containerizing-applications" >}})
