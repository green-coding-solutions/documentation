---
title: "Cluster Security"
description: "Hardening a GMT cluster installation"
lead: ""
date: 2024-10-25T01:49:15+00:00
weight: 1008
---


## Restricted user and roles

In the default installation one user is installed for the database and also for the API access.

In a cluster installation we recommend restricting both.

### Creating a management user for delete operations

We recommend having the default user active for the API to only have *SELECT* and *INSERT* operations.

That way if your are victim to an SQL injection or code injection the resulting injection cannot modifiy existing data.

```
CREATE USER manager WITH PASSWORD 'YOUR_PASSWORD';

REVOKE ALL PRIVILEGES ON DATABASE "green-coding" FROM manager;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM manager;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM manager;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM manager;

GRANT TEMPORARY ON DATABASE "green-coding" TO manager;


GRANT USAGE, SELECT ON SEQUENCE carbondb_types_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE carbondb_types TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_machines_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE carbondb_machines TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_tags_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE carbondb_tags TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_projects_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE carbondb_projects TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_sources_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE carbondb_sources TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_data_raw_id_seq TO manager;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE carbondb_data_raw TO manager;

GRANT USAGE, SELECT ON SEQUENCE carbondb_data_id_seq TO manager;
GRANT SELECT, INSERT, UPDATE ON TABLE carbondb_data TO manager;

GRANT SELECT ON TABLE ci_measurements TO manager;

GRANT SELECT ON TABLE runs TO manager;

GRANT SELECT ON TABLE phase_stats TO manager;

GRANT SELECT ON TABLE machines TO manager;


-- to insert errors
GRANT USAGE, SELECT ON SEQUENCE jobs_new_id_seq TO manager;
GRANT SELECT, INSERT ON TABLE jobs TO manager;
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

```
CREATE USER client WITH PASSWORD 'YOUR_PASSWORD';
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM client;

GRANT SELECT(id, name, uri, filename, branch, commit_hash, categories, machine_id, job_id, start_measurement, end_measurement, measurement_config, machine_specs, machine_id, usage_scenario, created_at, invalid_run, phases, logs, failed) on TABLE runs TO client;

GRANT INSERT ON TABLE runs TO client;
GRANT UPDATE(start_measurement, end_measurement, phases, logs, machine_id, machine_specs, measurement_config, usage_scenario, gmt_hash, invalid_run, failed) ON TABLE runs TO client;

GRANT SELECT, INSERT, UPDATE ON TABLE machines TO client;

GRANT INSERT on TABLE optimizations to client;
GRANT USAGE, SELECT ON SEQUENCE optimizations_id_seq TO client;
GRANT SELECT on TABLE optimizations to client;

GRANT SELECT on TABLE categories to client;
GRANT SELECT on TABLE notes to client;
GRANT SELECT on TABLE network_intercepts to client;

GRANT SELECT,INSERT,DELETE ON TABLE jobs TO client;
GRANT USAGE, SELECT ON SEQUENCE jobs_id_seq TO client;
GRANT UPDATE(state) ON TABLE jobs TO client;

GRANT SELECT,INSERT ON TABLE client_status TO client;
GRANT USAGE, SELECT ON SEQUENCE client_status_id_seq TO client;

GRANT SELECT(id) ON TABLE network_intercepts TO client;
GRANT INSERT ON TABLE network_intercepts TO client;
GRANT USAGE, SELECT ON SEQUENCE network_intercepts_id_seq TO client;

GRANT SELECT, INSERT ON TABLE measurements TO client;
GRANT USAGE, SELECT ON SEQUENCE stats_id_seq TO client;

GRANT INSERT ON TABLE notes TO client;
GRANT USAGE, SELECT ON SEQUENCE notes_id_seq TO client;

GRANT SELECT,INSERT ON TABLE phase_stats TO client;
GRANT USAGE, SELECT ON SEQUENCE phase_stats_id_seq TO client;

GRANT INSERT on changelog to client;
GRANT SELECT, USAGE on changelog_id_seq to client;
```

### Visibility / Deactivating the Default User

The default user has a default password and can see all runs by all other users on the system.
For additional security the default user can either be deactivated or downgraded and the password be changed.

Please note that the [User Management]({{< relref "user-management" >}}) is only part of the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) version.
