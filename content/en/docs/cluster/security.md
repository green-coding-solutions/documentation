---
title: "Cluster Security"
description: "Hardening a GMT cluster installation"
date: 2024-10-25T01:49:15+00:00
weight: 1008
---


## Restricted user and roles

In the default installation one user is installed for the database and also for the API access.

In a cluster installation we recommend restricting both.


### Creating a server user

The API / Dashboard should run on a separate instance and the user should have no insert or update permissions for runs and also some other restrictions.

```sql
REVOKE ALL PRIVILEGES ON DATABASE "green-coding" FROM server;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM server;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM server;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM server;

GRANT DELETE ON
    jobs,
    system_logs,
    watchlist
 TO server;

GRANT INSERT ON
    hog_simplified_measurements
    ci_measurements,
    jobs,
    watchlist,
    carbondb_data_raw,
    ip_data,
    hog_top_processes,
    client_status,
    carbon_intensity,
    system_logs,
TO server;

GRANT USAGE, SELECT ON SEQUENCE hog_simplified_measurements_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE ci_measurements_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE jobs_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE watchlist_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE carbondb_data_raw_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE ip_data_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE hog_top_processes_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE client_status_id_seq to SERVER;
GRANT USAGE, SELECT ON SEQUENCE carbon_intensity to SERVER;
GRANT USAGE, SELECT ON SEQUENCE system_logs to SERVER;

GRANT SELECT (id, type, state, name, url, branch, filename, category_ids, machine_id, message, created_at, updated_at, user_id, usage_scenario_variables, run_id, commit_hash, carbon_simulation) ON TABLE jobs to server; -- no email
GRANT SELECT (id, branch, carbon_simulation, category_ids, created_at, filename, image_url, last_marker, last_scheduled, machine_id, name, repo_url, schedule_mode, updated_at, usage_scenario_variables, user_id) ON watchlist TO server; -- no email

GRANT SELECT ON
    hog_simplified_measurements,
    runs,
    machines,
    ci_measurements,
    software_tasks,
    users,
    softwares,
    ip_data,
    network_intercepts,
    hog_top_processes,
    optimizations,
    phase_stats,
    carbon_intensity,
    client_status,
    notes,
    cluster_status_messages,
    system_logs,
    carbondb_data_raw,
    carbondb_data,
    carbondb_machines,
    carbondb_projects,
    carbondb_sources,
    carbondb_tags,
    carbondb_types,
    warnings,
    categories,
    cluster_changelog,
    measurement_metrics,
    measurement_values
TO server;

GRANT UPDATE (archived, branch, category_ids, commit_hash, commit_timestamp, container_dependencies, containers, created_at, end_measurement, failed, filename, gmt_hash, id, job_id, logs, machine_id, machine_specs, measurement_config, name, note, phases, public, relations, runner_arguments, start_measurement, updated_at, uri, usage_scenario, usage_scenario_variables, user_id) ON runs TO server;
GRANT UPDATE (available, base_temperature, configuration, cooldown_time_after_job, created_at, current_temperature, description, gmt_hash, gmt_timestamp, id, jobs_processing, needs_revalidation, status_code, updated_at) ON machines TO server;
GRANT UPDATE (run_id, state, updated_at) ON jobs TO server;
GRANT UPDATE (last_marker, last_scheduled, updated_at) ON watchlist TO server;
GRANT UPDATE (capabilities, docker_credentials, ssh_private_key) ON users TO server;
```

### Creating a management user for delete operations

We recommend having the default user active for the API to only have *SELECT* and *INSERT* operations.

That way if your are victim to an SQL injection or code injection the resulting injection cannot modifiy existing data.

```sql
CREATE USER manager WITH PASSWORD 'YOUR_PASSWORD';

REVOKE ALL PRIVILEGES ON DATABASE "green-coding" FROM manager;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM manager;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM manager;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM manager;

GRANT TEMPORARY ON DATABASE "green-coding" TO manager;

GRANT DELETE ON carbondb_data_raw TO manager;

GRANT INSERT ON carbon_intensity TO manager;
GRANT INSERT ON carbondb_data TO manager;
GRANT INSERT ON carbondb_data_raw TO manager;
GRANT INSERT ON carbondb_machines TO manager;
GRANT INSERT ON carbondb_projects TO manager;
GRANT INSERT ON carbondb_sources TO manager;
GRANT INSERT ON carbondb_tags TO manager;
GRANT INSERT ON carbondb_types TO manager;
GRANT INSERT ON ip_data TO manager;
GRANT INSERT ON jobs TO manager;
GRANT INSERT ON system_logs TO manager;


GRANT USAGE, SELECT ON SEQUENCE carbondb_data_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_data_raw_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_machines_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_projects_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_sources_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_tags_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE carbondb_types_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE ip_data_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE jobs_id_seq TO manager;
GRANT USAGE, SELECT ON SEQUENCE system_logs_id_seq TO manager;

GRANT SELECT ON carbon_intensity TO manager;
GRANT SELECT ON carbondb_data TO manager;
GRANT SELECT ON carbondb_data_raw TO manager;
GRANT SELECT ON carbondb_machines TO manager;
GRANT SELECT ON carbondb_projects TO manager;
GRANT SELECT ON carbondb_sources TO manager;
GRANT SELECT ON carbondb_tags TO manager;
GRANT SELECT ON carbondb_types TO manager;
GRANT SELECT ON categories TO manager;
GRANT SELECT ON ci_measurements TO manager;
GRANT SELECT ON hog_simplified_measurements TO manager;
GRANT SELECT ON ip_data TO manager;
GRANT SELECT ON jobs TO manager;
GRANT SELECT ON machines TO manager;
GRANT SELECT ON measurement_metrics TO manager;
GRANT SELECT ON phase_stats TO manager;
GRANT SELECT ON runs TO manager;
GRANT SELECT ON users TO manager;
GRANT SELECT ON warnings TO manager;


GRANT UPDATE ON public.carbondb_data TO manager;
GRANT UPDATE ON public.carbondb_data_raw TO manager;
GRANT UPDATE ON public.carbondb_machines TO manager;
GRANT UPDATE ON public.carbondb_projects TO manager;
GRANT UPDATE ON public.carbondb_sources TO manager;
GRANT UPDATE ON public.carbondb_tags TO manager;
GRANT UPDATE ON public.carbondb_types TO manager;

GRANT UPDATE (latitude, longitude, carbon_intensity_g, carbon_ug) ON ci_measurements TO manager;
GRANT UPDATE (latitude, longitude, carbon_intensity_g, operational_carbon_ug) ON hog_simplified_measurements TO manager;

```

To complement the configuration you need also have a different `config.yml` file present to read the credentials from.

You need to create a file called `manager-config.yml` in the GMT root directory, which will automatically be picked up by the cron jobs in `./cron/`

```yml
postgresql:
  host: green-coding-postgres-container
  dbname: green-coding
  port: 9573
  user: manager
  password: "YOUR PASSWORD"

admin:
  error_email: YOUR_EMAIL
  error_file: false

machine:
  id: 999
  description: "metrics.green-coding.io DB&Server"

```

### Creating a client user with restricted table access and no delete option

The client machines, which effectively run the measurements, should also have quite restricive user rights.

Since a rogue user can always escape from the docker container and infiltrate the host OS here the security concerns are even greater.

We recommend NOT to have SMTP credentials on the machines and also connect to the database with a very restrcted user.

```sql
CREATE USER client WITH PASSWORD 'YOUR_PASSWORD';


GRANT SELECT ON TABLE runs TO client; -- only needs a full select if optimizations are run on the measurement machines. Otherwise can be locked down

REVOKE ALL PRIVILEGES ON DATABASE "green-coding" FROM client;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM client;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM client;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM client;

GRANT INSERT ON public.jobs TO client;
GRANT INSERT ON public.measurement_metrics TO client;
GRANT INSERT ON public.measurement_values TO client;
GRANT INSERT ON public.network_intercepts TO client;
GRANT INSERT ON public.notes TO client;
GRANT INSERT ON public.optimizations TO client;
GRANT INSERT ON public.phase_stats TO client;
GRANT INSERT ON public.runs TO client;
GRANT INSERT ON public.system_logs TO client;
GRANT INSERT ON public.warnings TO client;

GRANT USAGE, SELECT ON SEQUENCE jobs_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE measurement_metrics_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE measurement_values_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE network_intercepts_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE notes_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE optimizations_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE phase_stats_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE runs_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE system_logs_id_sql TO client;
GRANT USAGE, SELECT ON SEQUENCE warnings_id_sql TO client;


GRANT SELECT (branch, carbon_simulation, category_ids, commit_hash, created_at, filename, id, machine_id, message, name, run_id, state, type, updated_at, url, usage_scenario_variables, user_id) ON public.jobs TO client; -- no email


GRANT SELECT ON public.categories TO client;
GRANT SELECT ON public.machines TO client;
GRANT SELECT ON public.measurement_metrics TO client;
GRANT SELECT ON public.measurement_values TO client;
GRANT SELECT ON public.network_intercepts TO client;
GRANT SELECT ON public.notes TO client;
GRANT SELECT ON public.optimizations TO client;
GRANT SELECT ON public.phase_stats TO client;
GRANT SELECT ON public.runs TO client;
GRANT SELECT ON public.users TO client;
GRANT SELECT ON public.warnings TO client;


GRANT UPDATE (capabilities) ON public.users TO client;
GRANT UPDATE (usage_scenario_dependencies, containers, end_measurement, failed, gmt_hash, logs, machine_id, machine_specs, measurement_config, phases, start_measurement, usage_scenario) ON public.runs TO client;
GRANT UPDATE (state) ON public.jobs TO client;
GRANT UPDATE ON public.machines TO client;
GRANT UPDATE ON public.phase_stats TO client;

```

### Visibility / Deactivating the Default User

The default user has a default password and can see all runs by all other users on the system.
For additional security the default user can either be deactivated or downgraded and the password be changed.

Please note that the [User Management]({{< relref "user-management" >}}) is only part of the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) version.
