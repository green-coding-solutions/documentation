---
title : "Configuration for measurements"
description: ""
lead: ""
date: 2022-06-20T08:48:45+00:00
draft: false
images: []
---

## Config.yml

The `config.yml` configures some global measurement settings that are used when
executing the `runner.py` directly or through cron mode.

All settings are done in the `measurement` key of the config.yml. Here is an example
configuration:

```yaml
measurement:
  idle-time-start: 5
  idle-time-end: 5
  flow-process-runtime: 60
  metric-providers:
    cpu.cgroup.container.provider.CpuCgroupContainerProvider: 100
    energy.RAPL.MSR.system.provider.EnergyRaplMsrSystemProvider: 100
    memory.cgroup.container.provider.MemoryCgroupContainerProvider: 100
    time.cgroup.container.provider.TimeCgroupContainerProvider: 100
    time.proc.system.provider.TimeProcSystemProvider: 100
```

- `idle-time-start` **[integer]**: Seconds to idle containers after orchestrating but before start of measurement
- `idle-time-end` **[integer]**: Seconds to idle containers after measurement
- `flow-process-runtime` **[integer]**: Max. duration in seconds how long one flow may take. Timeout-Exception is thrown if exceeded.
- `metric-providers`:
    + `METRIC_PROVIDER_NAME` **[interger]**: Key specifies the Metric Provider and the integer the resolution in milliseconds. [Possible Metric Providers →]({{< relref "metric-providers-overview" >}})




## Switches for runner.py
The `runner.py` script has multiple switches that can control the behaviour of the tool:
- `--uri` The URI to get the usage_scenario.yml from. 
    + If given a URL starting with `http(s)` the tool will try to clone a remote repository to `/tmp/green-metrics-tool/repo`
    + If given a local directory starting with `/` this will be used.


- `--name` A name which will be stored to the database to discern this run from others
- `--no-file-cleanup` to not delete the metric provider data in `/tmp/green-metrics-tool`
- `--debug` Activate steppable debug mode
    + This allows you to enter the containers and debug them if necessary.
- `--allow-unsafe` Activate unsafe volume bindings, ports and complex env vars
    + Arbitrary volume bindings into the containers. They are still read-only though
    + Portmappings to the host OS. 
        * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **ports** option for details
    + Non-Strict ENV vars mapped into container
        * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **environment** option for details
- `skip-unsafe` Skip unsafe volume bindings, ports and complex env vars
    + This is typically done when reusing already present `compose.yml` files without the need to alter the file

## Typical calls
### Local app
`python3 runner.py --uri PATH_TO_MY_SAMPLE_APP_FOLDER --name MY_NAME`

### Github repository
`python3 runner.py --uri https://github.com/MY_GITHUB_NAME/MY_REPO --name MY_NAME`
