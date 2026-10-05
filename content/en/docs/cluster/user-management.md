---
title: "User Management"
description: "User Management in cluster mode"
date: 2024-12-23T01:49:15+00:00
weight: 1005
---

In the FOSS version of GMT only two base users are configured and every action can be executed with them:

- USER 1 - The default user
- USER 0 - The GMT system user running control workloads and sending e-mails

## Default user

By default *USER 1* has full capabilities and can access all resources.

The *USER 1* has the token *DEFAULT* by default.

## Authentication mechanism

Running jobs on the CLI needs no authentication, however a *user_id* can be supplied to attribute a run to a certain user (See [Runner Switches →]({{< relref "/docs/measuring/runner-switches.md" >}}))

For API access an authentication header has to be supplied with name *X-Authentication*.

Here is an example cURL request:

```bash
    API_TOKEN='DEFAULT'
    curl https://api.green-coding.io/v1/user/settings \
         -H "X-Authentication: ${API_TOKEN}"
```

This route returns the capabilities of the user the token belongs to. They also contain the user's settings.

**Important:** If no *X-Authentication* header is supplied the API will still authenticate *USER 1* by default.

## Features of User Management

For complex usage cases GMT comes with a user management system that allows:

- Restricting certain routes to view content (GET)
- Restricting certain routes for submission of measurements, CI runs, Hog Data etc. (POST)
- Allowing longer / shorter data retention times for certain users
- Enabling *Super Admins* that can access all resources
- Restricting access to certain machines to run measurement jobs on
- Putting measurement quotas in place to be used for to certain machines to run measurement jobs on
- Restricting certain types of optimizations
- Restricting view access to content from other / selective users
- Allowing badge access to the public, but restricting everything else

Please note that the user management system is bundled with GMT but managed and fully documented as part of the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) package.
Furthermore many features like needed maintenance jobs / cron jobs and ACL generators are only shipped with the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) version.

We believe that user management is only needed in bigger corporate settings and thus we encourage you to support this project by considering upgrading to a [paid version](https://www.green-coding.io/products/green-metrics-tool) which includes the User Management either included in the SaaS version or the Enterprise version.

## Measurement capabilities

Every user has a `capabilities` JSON object in the `users` table. The following keys under `measurement` control what a usage scenario may do on a measurement machine.
This excerpt shows the values of the default *USER 1* from `docker/seed-data.sql`.

```json
{
  "measurement": {
    "allowed_volume_mounts": [],
    "orchestrators": {
      "docker": {
        "allowed_run_args": []
      },
      "host": {}
    }
  }
}
```

You can read the capabilities of your own user with the cURL request from [Authentication mechanism](#authentication-mechanism).

### Host execution

`measurement.orchestrators.host` allows flows that run their commands directly on the host instead of inside a container. These are flows whose `container` key is set to `null` or left empty, see [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}}).
`shell.py` runs its command the same way and needs the same capability, see [Shell mode →]({{< relref "/docs/measuring/shell-mode.md" >}}).

The key only has to be present. Its value is an empty object.

If a usage scenario contains a host flow and the user does not have the capability, the run fails with a `PermissionError` right after the usage scenario is parsed. This check also applies to runs on the command line, which belong to the user given with `--user-id` (default 1).
Runs that contain host flows get a warning that these commands are not sandboxed and that the results are not directly comparable to fully containerized runs.

Only *USER 1* has this capability by default, so that host execution works out of the box on a local installation. The database migration that introduced it granted it to *USER 1* only. The following statement revokes it again on a cluster.

```sql
UPDATE users SET capabilities = capabilities #- '{measurement,orchestrators,host}' WHERE id = 1;
```

{{< callout context="caution" icon="outline/alert-triangle" >}}
Commands in host flows are not sandboxed. They run directly on the measurement machine with the permissions of the user that runs GMT. Only grant this capability to users you fully trust.
{{< /callout >}}

### Volume mounts

Jobs on a cluster always run without `--allow-unsafe`. In this mode the volumes of a service follow these rules.

- A volume must have the form `source:target` or `source:target:ro`. `readonly` is accepted instead of `ro`. Any other option is rejected.
- Without an allow-list entry a volume must be read-only and its source must be a path inside the repository. Relative paths are resolved from the folder of the `usage_scenario.yml`.
- Writable volumes, absolute host paths and named Docker volumes need an entry in `measurement.allowed_volume_mounts`.

Each entry is compared as an exact string with the source of the volume. For a read-only volume append `,readonly` to the source in the entry. A writable entry does not allow a read-only volume with the same source, and the other way round.

```json
"allowed_volume_mounts": [
  "/opt/datasets",
  "/opt/models,readonly",
  "my-named-volume"
]
```

With this list a usage scenario may use `/opt/datasets:/data` (writable), `/opt/models:/models:ro` (read-only) and `my-named-volume:/cache` (writable).

- An absolute path is mounted as a bind mount. The path must exist on the machine. Symlinks in it are resolved before mounting.
- A source starting with `.` is rejected even if it is listed, because allow-listed paths must be absolute.
- Any other source is treated as the name of a Docker volume. The volume must already exist on the machine, because GMT does not create named volumes.

The database migration that introduced `allowed_volume_mounts` set it to an empty list for every user and removed the former `measurement.allow_unsafe` capability.

### Docker run arguments

`measurement.orchestrators.docker.allowed_run_args` lists the `docker-run-args` that a usage scenario may set for a service, see [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}}).
Each entry is a regular expression that must match a complete `docker-run-args` entry. Any argument without a match fails the run with `Argument '...' is not allowed in the docker-run-args list`.

```json
"orchestrators": {
  "docker": {
    "allowed_run_args": [
      "--shm-size=[0-9]+[mg]",
      "--cap-add IPC_OWNER"
    ]
  }
}
```

Both allow-lists only apply to jobs that run on a cluster. `runner.py` does not read them, so on the command line use `--allow-unsafe` instead. See [Runner switches →]({{< relref "/docs/measuring/runner-switches.md" >}})
