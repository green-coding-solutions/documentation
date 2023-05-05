---
title : "Configuration"
description: ""
lead: ""
date: 2022-06-20T08:48:45+00:00
weight: 801
---

## Config.yml

The `config.yml` configures some global measurement settings that are used when
executing the `runner.py` directly or through cron mode.

Here is an example configuration:

```yaml
postgresql:
 ...
smtp:
 ...
cluster:
  api_url: http://api.green-coding.internal:9142
  metrics_url: http://metrics.green-coding.internal:9142

machine:
  id: 1
  description: "Development machine for testing"

measurement:
  idle-time-start: 10
  idle-time-end: 5
  flow-process-runtime: 1800
  phase-transition-time: 1
  metric-providers:
    linux:
      cpu.utilization.cgroup.container.provider.CpuUtilizationCgroupContainerProvider:
        resolution: 100
      cpu.energy.RAPL.MSR.system.provider.CpuEnergyRaplMsrSystemProvider:
        resolution: 100
      memory.total.cgroup.container.provider.MemoryTotalCgroupContainerProvider:
        resolution: 100
      cpu.time.cgroup.container.provider.CpuTimeCgroupContainerProvider:
        resolution: 100
  #    psu.energy.ac.xgboost.system.provider.PsuEnergyAcXgboostSystemProvider:
  #      resolution: 100
        # This is a default configuration. Please change this to your system!
  #      CPUChips: 1
  #      HW_CPUFreq: 3100
  #      CPUCores: 28
  #      TDP: 150
  #      HW_MemAmountGB: 16

admin:
  # This address will get an email, when a new project was added through the frontend
  email: myemail@dev.internal
  # no_emails: True will suppress all emails. Helpful in development servers
  no_emails: True

```

The `postgresql`, `smtp` and `cluster` key were already discussed in the [installation →]({{< relref "installation-linux" >}}) part.

The `machine` key has `id` and `description` that are mandatory fields and will be registered in the DB on first run.

We will this only focus on the `measurement` key:

- `idle-time-start` **[integer]**: Seconds to idle containers after orchestrating but before start of measurement
- `idle-time-end` **[integer]**: Seconds to idle containers after measurement
- `flow-process-runtime` **[integer]**: Max. duration in seconds for how long one flow should take. Timeout-Exception is thrown if exceeded.
- `phase-transition-time` **[integer]**: Seconds to idle between phases
- `metric-providers`:
  + `linux`/`macos`/`common` **[string]**: Specifies under what system the metric provider can run. Common implies it could run on either.
    * `METRIC_PROVIDER_NAME` **[string]**: Key specifies the Metric Provider. [Possible Metric Providers →]({{< relref "metric-providers-overview" >}})
    * `METRIC_PROVIDER_NAME.resolution` **[integer]**: sampling resolution in ms

Some metric providers have unique configuration params:

- PsuEnergyAcXgboostSystemProvider
  + Please look at the always current documentation here to understand what values to plug in here: [XGBoost SPECPower Model documentation](https://github.com/green-coding-berlin/spec-power-model)

Also note that some providers are deactivated by default, because they either need a
additional configuration parameters, extra hardware or a specially configured system.

Once you have set them up you can uncomment the line. In this example for instance
the line `psu.energy.ac.xgboost.system.provider.PsuEnergyAcXgboostSystemProvider` and all
the lines directly below it.

### admin

The `admin` key provides no configuration for the measurements themselves, but rather how
the framework behaves.

- `email`: The email where to error mails and debug mails to
- `no_emails`: If the framework should send emails at all (including error mails).
  + If you have not SMTP configured you must set this to `False`

## Switches for runner.py

Apart from the `config.yml` some configuration is additionally possible when doing manual runs
with the `runner.py`.

- `--uri` The URI to get the usage_scenario.yml from.
  + If given a URL starting with `http(s)` the tool will try to clone a remote repository to `/tmp/green-metrics-tool/repo`
  + If given a local directory starting with `/`, this will be used instead.
- `--branch` When providing a git repository, optionally specify a branch
- `--name` A name which will be stored to the database to discern this run from others
- `--filename` An optional alternative filename if you do not want to use "usage_scenario.yml"
- `--config-override` Override the configuration file with the passed in yml file.  
  + Must be located in the same directory as the regular configuration file. Pass in only the name.
- `--no-file-cleanup` flag to not delete the metric provider data in `/tmp/green-metrics-tool`
- `--debug` flag to activate steppable debug mode
  + This allows you to enter the containers and debug them if necessary.
- `--allow-unsafe` flag to activate unsafe volume bindings, ports, and complex env vars
  + Arbitrary volume bindings into the containers. They are still read-only though
  + Port mappings to the host OS.
    * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **ports** option for details
  + Non-Strict ENV vars mapped into container
    * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **environment** option for details
- `--skip-unsafe` flag to skip unsafe volume bindings, ports and complex env vars
  + This is typically done when reusing already present `compose.yml` files without the need to alter the file
- `--skip-config-check` Skip checking the configuration
- `--verbose-provider-boot` flag to boot metric providers gradually
  + This will enable the user to see the impact of each metric provider more clearly
  + There will be a 10 second sleep for two seconds after each provider boot
  + `RAPL` metric providers will be prioritized to start first, if enabled
- `--full-docker-prune` Prune all images and build caches on the system
- `--dry-run` Removes all sleeps. Resulting measurement data will be skewed.
- `--dev-repeat-run` Checks if a docker image is already in the local cache and will then not build it.
  + Also doesn't clear the images after a run

These options are not available when doing cron runs.

## Typical calls

### Local app

```console
python3 runner.py --uri PATH_TO_MY_SAMPLE_APP_FOLDER --name MY_NAME`
```

### Github repository

```console
python3 runner.py --uri https://github.com/MY_GITHUB_NAME/MY_REPO --name MY_NAME
```
