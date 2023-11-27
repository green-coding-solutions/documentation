---
title : "Configuration"
description: ""
lead: ""
date: 2022-06-20T08:48:45+00:00
weight: 825
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

client:
  sleep_time_no_job: 300
  sleep_time_after_job: 300

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

The `postgresql`, `smtp` and `cluster` key were already discussed in the [installation →]({{< relref "/docs/installation/installation-linux" >}}) part.

The `machine` key has `id` and `description` that are mandatory fields and will be registered in the DB on first run.

Here we focus on the `measurement` key:

- `idle-time-start` **[integer]**: Seconds to idle containers after orchestrating but before start of measurement
- `idle-time-end` **[integer]**: Seconds to idle containers after measurement
- `flow-process-runtime` **[integer]**: Max. duration in seconds for how long one flow should take. Timeout-Exception is thrown if exceeded.
- `phase-transition-time` **[integer]**: Seconds to idle between phases
- `metric-providers`:
  + `linux`/`macos`/`common` **[string]**: Specifies under what system the metric provider can run. Common implies it could run on either.
    * `METRIC_PROVIDER_NAME` **[string]**: Key specifies the Metric Provider. [Possible Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}})
    * `METRIC_PROVIDER_NAME.resolution` **[integer]**: sampling resolution in ms

Some metric providers have unique configuration params:

- PsuEnergyAcXgboostSystemProvider
  + Please look at the always current documentation to understand what values to plug in here: [XGBoost SPECPower Model documentation](https://github.com/green-coding-berlin/spec-power-model)

Also note that some providers are deactivated by default, because they either need
additional configuration parameters, extra hardware or a specially configured system.

Once you have set them up you can uncomment the line. In this example for instance
the line `psu.energy.ac.xgboost.system.provider.PsuEnergyAcXgboostSystemProvider` and all
the lines directly below it.

### client

The `client` key provides the possibility to change the waiting time of the job client:

- `sleep_time_no_job` **[integer]**: Seconds the job client should wait before retrying to get another job
- `sleep_time_after_job` **[integer]**: Seconds the job client should wait after a job is done

### admin

The `admin` key provides no configuration for the measurements themselves, but rather how
the framework behaves.

- `email`: The email where to error mails and debug mails to
- `no_emails`: If the framework should send emails at all (including error mails).
  + If you have not SMTP configured you must set this to `False`
