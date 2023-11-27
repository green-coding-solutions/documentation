---
title: "Quick Start"
description: "One page summary of how to measure a sample application."
lead: "One page summary of how to measure a sample application."
date: 2022-06-18T08:00:00+00:00
draft: true
images: []
menu:
  docs:
    parent: "prologue"
weight: 130
toc: true
---

## Running a measurement with a GitHub Repository

The easiest way to run a measurement is to use our [Green Metrics Frontend](https://metrics.green-coding.berlin/request.html).

Here you can supply the link of our [easiest example application](https://github.com/green-coding-berlin/simple-example-application) and wait
for an email to arrive to view a report.

This example highlights that in order to measure an application you only need a repository which includes a
 [usage_scenario.json →]({{< relref "usage-scenario" >}}) file.


## Running a measurement with a sample usage scenario


### Prerequsites

For the most basic setup you require:
- a computer with a **Linux** operating system
- `sudo` rights
- `git`
- `python3` including `pandas` and `pyyaml`
- `docker` installed and preferably running in rootless-mode

If you currently do not have these packages already available please refer to [Installation on Linux →]({{< relref "installation-linux" >}}) or [Installation on macOS →]({{< relref "installation-macos" >}})

If you already have that and want to skip the installation, please only add one entry to your `/etc/hosts`:

`127.0.0.1 metrics.green-coding.internal api.green-coding.internal`

### Setting up a sample measurement run

We will make the most basic example our tool can handle:
- Base of **Ubuntu** base container.
- Add the package `stress` from `aptitude`
- Just run a 5 seconds stress run with default metrics providers

So let's start:
```bash
git pull https://www.github.com/green-coding-berlin/green-metrics-tool /tmp/green-metrics-tool && \
cd /tmp/green-metrics-tool/Docker && \
cp compose.yml.example compose.yml
```
Please now change the default password for your database. In our example we will use `superstar`
```bash
docker compose up -d && \
cd /tmp && \
mkdir easiest-application && \
cd easiest-application && \
touch usage_scenario.json
```
Now please copy the following code inside the usage_scenario.json.
```json
{
    "name": "Stress Container One Core 5 Seconds",
    "author": "Arne Tarara",
    "architecture": "linux",
    "setup": [
          {
            "name": "ubuntu-base-container",
            "type": "container",
            "identifier": "ubuntu",
            "setup-commands": [
                "apt update",
                "apt install stress -y"
            ]
        }
    ],
    "flow": [
        {
            "name": "Stress",
            "container": "ubuntu-base-container",
            "commands": [

                {
                    "type": "console",
                    "command": "stress -c 1 -t 5",
                    "note": "Starting Stress"
                }
            ]
        }
    ]
}

```
In the code you see the *identifier* which references the **Ubuntu** base image.

Under *flow* you see that we are just calling `stress -c 1 -t 5`, which will stress our CPU for 5 seconds on one core.
```bash
cd /tmp/green-metrics-tool/tools && \
python3 runner.py manual --folder /tmp/easiest-application --name testing-my-demo
````

You should see an example output like so:

```bash
Having usage scenario ....
....
Please access your report with the ID: XXXX-XXXX ...
```

Now you can view the report as the first item in your metrics dashboard at `http://metrics.green-coding.internal:9142`
