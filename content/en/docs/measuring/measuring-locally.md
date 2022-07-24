---
title : "Measuring locally"
description: "Measuring locally with the runner.py"
lead: ""
date: 2022-06-18T08:48:45+00:00
draft: false
images: []
---

Before starting to measure you must first install some prerequisites: [Installation →]({{< relref "installation-overview" >}})

## Measuring a simple example load

We will make the most basic example our tool can handle:
- Base of **alpine** base container.
- Add the package `stress-ng` from `apk`
- Just run a 5 seconds stress run with default metrics providers

So let's start by going to the install folder of the Green Metrics Tool on your system and 
then preparing the `usage_scenario.yml`:

```bash
cd PATH_TO_GREEN_METRICS_TOOL/docker
docker compose up -d
cd /tmp
mkdir easiest-application
cd easiest-application
touch usage_scenario.yml
```
Now please copy the following code inside the `usage_scenario.yml`.
```json
{
    "name": "Stress Container One Core 5 Seconds",
    "author": "Arne Tarara",
    "version": 1,
    "architecture": "linux",
    "setup": [
          {
            "name": "simple-load-container",
            "type": "container",
            "identifier": "alpine",
            "setup-commands": [
                "apk add stress-ng"
            ]
        }
    ],
    "flow": [
        {
            "name": "Stress",
            "container": "simple-load-container",
            "commands": [

                {
                    "type": "console",
                    "command": "stress-ng -c 1 -t 5",
                    "note": "Starting Stress"
                }
            ]
        }
    ]
}

```
In the code you see the *identifier* which references the **alpine** base image.

Under *flow* you see that we are just calling `stress-ng -c 1 -t 5`, which will stress our CPU for 5 seconds on one core.
```bash
cd PATH_TO_GREEN_METRICS_TOOL/tools
python3 runner.py --uri /tmp/easiest-application --name testing-my-demo
````

You should see an example output like so:

```bash
Having usage scenario ....
....
....
Please access your report with the ID: XXXX-XXXX ...
```

Now you can view the report as the first item in your metrics dashbard at [http://metrics.green-coding.local:8000/request.html](http://metrics.green-coding.local:8000/request.html)


## Cron mode

If you have [installed a cronjob →]({{< relref "installation-overview" >}}) you can insert a new job at [http://metrics.green-coding.local:8000/request.html](http://metrics.green-coding.local:8000/request.html)

<p align="center">
  <img src="/img/add-new-project.webp" width="80%" title="Cron mode job insertion for green metrics tool">
</p>

It will be automatically picked up and you will get sent an email with the link to the results.

In order for the email to work correctly you must set the configuration in your used `config.yml`.
