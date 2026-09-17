---
title : "Configuration"
description: ""
date: 2022-06-20T08:48:45+00:00
weight: 425
---

Configurations in the GMT happen at two central places.

The file based [config.yml](#configyml) and the Dashboard based [User Settings](#user-settings)

## config.yml

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
    update_os_packages: True
    # the value is passed to systemctl, so it must be a verb like "suspend" or "poweroff". False disables it
    shutdown_on_job_no: suspend
    reboot_after_seconds: False
    # These two parameters have only effect in cluster mode. When using CLI they will be set via flags --docker-prune and --full-docker-prune only
    docker_prune: True
    full_docker_prune: False
    # define a workload to check cluster noise floor
    time_between_control_workload_validations: 21600
    send_control_workload_status_mail: False
    control_workload:
      name: "Measurement control Workload"
      uri: "https://github.com/green-coding-solutions/measurement-control-workload"
      filename: "usage_scenario.yml"
      branch: "event-bound"
      comparison_window: 5
      phase: "004_[RUNTIME]"
      metrics:
        psu_energy_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        psu_power_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_power_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_energy_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        network_total_cgroup_container:
          threshold: 10000 # 10 kB
          type: stddev

machine:
  id: 1
  description: "Development machine for testing"
  base_temperature_value: False
  base_temperature_chip: False
  base_temperature_feature: False


measurement:
  full_docker_prune_whitelist:
    - martizih/kaniko:slim
  metric_providers:
    linux:
      cpu_utilization_cgroup_container:
        sampling_rate: 99
      cpu_energy_rapl_msr_component:
        sampling_rate: 99
      memory_used_cgroup_container:
        sampling_rate: 99
      cpu_time_cgroup_container:
        sampling_rate: 99
    # ...

admin:
  notification_email: False
  email_bcc: False
  error_file: False
  error_email: False

```

The `postgresql`, `smtp` and `cluster` key were already discussed in the [installation →]({{< relref "/docs/installation/installation-linux" >}}) part.

### cluster

Only the following three variables are important for a local installation:

- `api_url` **[str]**: URL including schema where the API is locates
- `metrics_url` **[str]**: URL including schema where the API is locates
- `cors_allowed_orgins` **[list]**: Allowed URLs for CORS requests to the API. It should at least include your chosen `api_url` and `metrics_url`

For the rest please see [installation →]({{< relref "/docs/cluster/installation" >}})

### machine

If you run locally nothing needs to be configured here.

But if you run a *cluster* you must set the base temperature values for the accuracy control to work as well as configure the host reservation for CPU and memory.

Please see [cluster installation →]({{< relref "/docs/cluster/installation" >}}), [accuracy control →]({{< relref "/docs/cluster/accuracy-control" >}}) and [host resource reservations]({{< relref "/docs/cluster/host-resource-reservations" >}}).

Also see [Resource Limits]({{< relref "/docs/measuring/resource-limits" >}}) to better understand how GMT enforces resource limits on its orchestrated containers.

GMT can also verify a range of optional hardware and OS properties before each measurement run — CPU governor, turbo boost, SMT state, installed RAM, connected USB/PCI devices, RAPL power limits, and more. All are opt-in via keys under `machine:` in `config.yml`; a couple of checks (systemd timers, cron files, kernel watchdog) need no key at all and always run on Linux.

See [Machine Baseline Checks →]({{< relref "/docs/cluster/machine-baseline-checks" >}}) for the full list and configuration reference.

### measurement

- `full_docker_prune_whitelist`  **[list]**: A list of images that will be whitelisted when `--full-docker-prune` is active. Images listed here will not be pruned. Useful for cluster installations where non security critical images shall be kept that take long to download.
    + Every entry is matched as a *substring* against the `repository:tag` of each local image, so a tag may be included to whitelist only a specific version. Image IDs do not work.
- `metric_providers`:
    + `linux`/`macos`/`common` **[string]**: Specifies under what system the metric provider can run. Common implies it could run on either.
        * `METRIC_PROVIDER_NAME` **[string]**: Key specifies the Metric Provider. [Possible Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}})
        * `METRIC_PROVIDER_NAME.sampling_rate` **[integer]**: sampling rate in ms

The name of a metric provider is a flat snake_case key like `cpu_energy_rapl_msr_component`. GMT derives
the module and the class to load from that name, so the older dotted class-path notation
(`cpu.energy.RAPL.MSR.component.provider.CpuEnergyRaplMsrComponentProvider`) is no longer valid and
will fail on import.

All keys below a metric provider are passed to it as configuration parameters, so only supply keys
that the provider actually accepts.

Some metric providers have unique configuration params:

- `psu_energy_ac_xgboost_machine`
    + Requires `HW_CPUFreq`, `CPUChips`, `CPUThreads`, `TDP` and `HW_MemAmountGB`. Optional are `CPUCores`, `Hardware_Availability_Year` and `VHost_Ratio`.
    + This provider does not sample, so it accepts **no** `sampling_rate` key. Supplying one will make the run fail.
    + Please look at the always current documentation to understand what values to plug in here: [XGBoost SPECPower Model documentation](https://github.com/green-coding-solutions/spec-power-model)

Also note that some providers are deactivated by default, because they either need
additional configuration parameters, extra hardware or a specially configured system.

Once you have set them up you can uncomment the line. In this example for instance
the line `psu_energy_ac_xgboost_machine` and all
the lines directly below it.

### admin

The `admin` key provides no configuration for essential configurations like for instance error handling and
email behaviour if configured

- `notification_email` **[str|bool]**: This address will get an email, for any error or new project added etc.
- `email_bcc` **[str|bool]**: This email will always get a copy of every notification email sent, even for user-only mails like the "Your report is ready" mail.
- `error_file` **[str|bool]**: Takes a file path to log all the errors to it. This is disabled if False
- `error_email` **[str|bool]**: Sends an error notification also via email. This is disabled if False

## optimization

Here you can ignore certain optimizations to not run.

All possible optimizations are found in the `/optimization_providers` folder of the GMT.

To disable for instance the *container_build_time* optimization you could set:

```yml
optimization:
  ignore:
    - container_build_time
```

## sci

Please see for details: [SCI →]({{< relref "carbon/sci" >}}).

## electricity_maps_token

If you are using [Eco CI](https://www.green-coding.io/products/eco-ci) or [Carbon DB](https://www.green-coding.io/products/eco-ci) you need to configure Electricitymaps with a valid API token to get carbon intensity data.

The value is a string.

Example:

```yml
electricity_maps_token: 'MY_TOKEN'
```

## User Settings

Settings that are specifc to a user and apply to all machines that you are measuring on equally are to be configured via the Dashboard.
For local installations these are to be found under [https://metrics.green-coding.internal:9142/settings.html](https://metrics.green-coding.internal:9142/settings.html). If you use our [Hosted Service](https://metrics.green-coding.io/) you find it at [https://metrics.green-coding.io/settings.html](https://metrics.green-coding.io/settings.html)

- `disabled_metric_providers` **[list]**: Providers to disable even if they are configured on the machine. Only these two values are accepted:
    + *network_connections_tcpdump_system*
    + *network_connections_proxy_container*
- `flow_process_duration` **[integer]**: Max. duration in seconds for how long one process in a flow should take. Timeout-Exception is thrown if exceeded.
- `total_duration` **[integer]**: Max. duration in seconds for how long the whole run  may take. Including building containers, baseline, idle, runtime and removal phases.
- `dev_no_sleeps` **[bool]**: Does not sleep in between phases and for cool-down periods. Beware that this will speed up runs on the cluster but render them invalid.
- `skip_optimizations` **[bool]**: De-activates running the optimizations after a measurement.

The equivalent when running the `runner.py` directly are the [runner.py switches →]({{< relref "runner-switches" >}}).

<center><img style="width: 600px;" src="/img/dashboard-settings.webp" alt="Dashboard Settings for GMT Measurements"></center>
