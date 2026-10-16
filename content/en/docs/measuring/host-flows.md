---
title: "Flows on the host"
description: "Run flow commands of a usage_scenario.yml directly on the host instead of inside a container"
date: 2026-10-12T00:00:00+00:00
weight: 432
toc: true
---

A flow with `container: null` (or an empty `container:` key) in a [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}}) runs its commands directly on the host system instead of inside a container.

```yaml
name: Host Execution
author: Jane Doe
description: Runs flow commands directly on the host instead of inside a container

flow:
  - name: Host Echo
    container: null
    commands:
      - type: console
        command: echo "hello from the host"
        note: Running echo on the host

  - name: Compile on host
    container: null
    commands:
      - type: console
        command: make -j4
        shell: bash
```

If you only want to measure a single command on the host you do not need a `usage_scenario.yml` at all. See [Shell mode →]({{< relref "/docs/measuring/shell-mode.md" >}}).

{{< callout context="caution" icon="outline/alert-triangle" >}}
Commands in host flows are not sandboxed. They run directly on the measurement machine with the permissions of the user that runs GMT. GMT adds a warning to every run that contains host flows, because the measurement data is not directly comparable to fully containerized runs.
{{< /callout >}}

## Rules

- Host flows only support commands of type `console`.
- The user that runs the measurement needs the `measurement.orchestrators.host` capability. Otherwise the run aborts with a `PermissionError` right after the usage scenario is parsed. On a fresh installation only the DEFAULT user (id 1) has this capability. See [User Management →]({{< relref "/docs/cluster/user-management.md#host-execution" >}}).
- Without `shell` the command is split like a command line and executed directly without a shell.
- With `shell` the command is executed in that shell with the [strict shell options →]({{< relref "/docs/measuring/usage-scenario#strict-shell-options" >}}). You can change them with `shell-options`.
- Notes and logs of host flows are shown under the name `[HOST]`.
- `services` is optional. If the `usage_scenario.yml` has no services, GMT disables all metric providers that need containers (the ones ending in `_container`, for example `cpu_utilization_cgroup_container`) and adds a warning for each of them.

Host flows and container flows can be mixed in the same scenario.

## Shell options on the host

On the host you can also use shells that do not follow the POSIX `-c` convention. The [strict shell options →]({{< relref "/docs/measuring/usage-scenario#strict-shell-options" >}}) then depend on the shell.

- `powershell` and `pwsh` have no such switches. GMT prepends `$ErrorActionPreference = 'Stop'` and `Set-StrictMode -Version Latest` as statements to the command instead. There is no equivalent for `pipefail`. If you set `shell-options` for PowerShell, a string is prepended as one statement and a list as one statement per entry.
- `cmd` has no way to express these options. GMT sets none and aborts the run if you configure non-empty `shell-options`.
- Every other shell is treated as a POSIX shell and gets `-o errexit -o nounset -o pipefail` like inside a container.
