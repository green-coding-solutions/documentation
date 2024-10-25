---
title : "Configuration"
description: ""
lead: ""
date: 2022-06-20T08:48:45+00:00
weight: 825
---

## Config.yml

The `config.yml` configures some global measurement settings that are used when
executing the `runner.py` directly or through cron / cluster-client mode.

Here is an example configuration:

```yaml
postgresql:
  host: green-coding-postgres-container
  user: postgres
  dbname: green-coding
  password: PLEASE_CHANGE_THIS
  port: 9573

redis:
  host: green-coding-redis-container

smtp:
  server: SMTP_SERVER
  sender: SMTP_SENDER
  port: SMTP_PORT
  password: SMTP_AUTH_PW
  user: SMTP_AUTH_USER

cluster:
  api_url: __API_URL__
  metrics_url: __METRICS_URL__
  cors_allowed_origins:
    - __API_URL__
    - __METRICS_URL__
  client:
    sleep_time_no_job: 300
    jobs_processing: "random"
    time_between_control_workload_validations: 21600
    send_control_workload_status_mail: False
    shutdown_on_job_no: False
    control_workload:
      name: "Measurement control Workload"
      uri: "https://github.com/green-coding-berlin/measurement-control-workload"
      filename: "usage_scenario.yml"
      branch: "main"
      comparison_window: 5
      threshold: 0.01
      phase: "004_[RUNTIME]"
      metrics:
        - "psu_energy_ac_mcp_machine"
        - "psu_power_ac_mcp_machine"
        - "cpu_power_rapl_msr_component"
        - "cpu_energy_rapl_msr_component"

machine:
  id: 1
  description: "Development machine for testing"
  base_temperature_value: False
  base_temperature_chip: False
  base_temperature_feature: False

measurement:
  system_check_threshold: 3 # Can be 1=INFO, 2=WARN or 3=ERROR
  pre-test-sleep: 5
  idle-duration: 5
  baseline-duration: 5
  flow-process-duration: 1800 # half hour
  total-duration: 3600 # one hour
  post-test-sleep: 5
  phase-transition-time: 1
  boot:
    wait_time_dependencies: 60
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
    # ...

admin:
  notification_email: False
  notification_email_bcc: False
  error_file: False
  error_email: False

```

The `postgresql`, `smtp` and `cluster` key were already discussed in the [installation →]({{< relref "/docs/installation/installation-linux" >}}) part.

## machine
If you run locally nothing needs to be configured here. But if you run a *cluster* you must set the base temperature values for the accuracy control to work

Please see [cluster installation →]({{< relref "/docs/cluster/installation" >}}) and [accuracy control →]({{< relref "/docs/cluster/accuracy-control" >}})


## cluster

Only the following three variables are important for a local installation:

- `api_url` **[str]**: URL including schema where the API is locates
- `metrics_url` **[str]**: URL including schema where the API is locates
- `cors_allowed_orgins` **[list]**: Allowed URLs for CORS requests to the API. It should at least include your chosen `api_url` and `metrics_url`

For the rest please see [installation →]({{< relref "/docs/cluster/installation" >}})


## measurement

- `system_check_threshold` **[integer]: Level at which an exception will be raised for system checks. The lower the more restrictive system checks are. We recommend *3* for development and *2* for cluster setups. *1* only for debugging.
- `pre-test-sleep` **[integer]**: Seconds to idle containers after orchestrating but before start of measurement
- `post-test-sleep` **[integer]**: Seconds to idle containers after measurement
- `flow-process-duration` **[integer]**: Max. duration in seconds for how long one flow should take. Timeout-Exception is thrown if exceeded.
- `total-duration` **[integer]**: Max. duration in seconds for how long the whole benchmark may take. Including building containers, baseline, idle, runtime and removal phases.
- `idle-duration` **[integer]**: Duration in seconds for the idle phase
- `baseline-duration` **[integer]**: Duration in seconds for the baseline phase
- `phase-transition-time` **[integer]**: Seconds to idle between phases
- `boot`:
  + `wait_time_dependencies`: **[integer]**: Max. duration in seconds to wait for dependencies (defined with `depends_on`) to be ready. If duration is reached and a dependency is not ready, the measurement will fail.
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


### admin

The `admin` key provides no configuration for essential configurations like for instance error handling and 
email behaviour if configured

- `notification_email` **[str|bool]**: This address will get an email, for any error or new project added etc.
- `notification_email_bcc` **[str|bool]**: This email will always get a copy of every notification email sent, even for user-only mails like the "Your report is ready" mail.
- `error_file` **[str|bool]**: Takes a file path to log all the errors to it. This is disabled if False
- `error_email` **[str|bool]**: Sends an error notification also via email. This is disabled if False
