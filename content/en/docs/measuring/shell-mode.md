---
title: "Shell mode (shell.py)"
description: "Measure a single shell command directly on the host with shell.py"
date: 2026-10-05T00:00:00+00:00
weight: 431
toc: true
---

`shell.py` lives next to `runner.py` in the root folder of the Green Metrics Tool. It takes one shell command and measures it with the normal GMT measurement lifecycle. You do not need a `usage_scenario.yml`, a Dockerfile or a container for this.

Internally `shell.py` builds a usage scenario in memory. This scenario has a single flow called **Shell Command** with `container: null`. The command therefore runs directly on the host system in the shell of your choice and not inside a container.

## When to use shell mode

Shell mode is meant for quick measurements. Typical cases are:

- Getting a first impression of how much energy a CLI tool, a script or a build command uses
- Trying out a command before you put the effort into containerizing it
- Checking that your metric providers deliver data on a machine

{{< callout context="caution" icon="outline/alert-triangle" >}}
Shell mode results are not directly comparable to containerized runs. The command is not sandboxed and not isolated from the rest of the system. Everything else that runs on the machine at the same time ends up in the system level metrics. GMT stores a warning with every run that contains host flows, and `shell.py` itself reminds you on start to use the Docker version for exact measurements on the cluster.
{{< /callout >}}

For exact and reproducible measurements use [runner.py →]({{< relref "/docs/measuring/runner-switches.md" >}}) with a containerized [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}}).

## Prerequisites

- A working GMT installation. See [Installation on Linux →]({{< relref "/docs/installation/installation-linux" >}}), [Installation on macOS →]({{< relref "/docs/installation/installation-macos" >}}) or [Installation on Windows →]({{< relref "/docs/installation/installation-windows" >}})
- The GMT venv must be active. Like `runner.py`, `shell.py` refuses to start outside of it.
- The GMT database must be reachable. `shell.py` reads the permissions of the executing user from the database and stores the results there.
- The executing user needs the `host` orchestrator capability. The default local user (ID 1) has it. See [Host execution capability](#host-execution-capability) below.
- Metric providers configured in your `config.yml`. See [Configuration →]({{< relref "/docs/measuring/configuration.md" >}}) and [Metric Providers →]({{< relref "/docs/measuring/metric-providers/metric-providers-overview" >}})

### Which metric providers make sense

A shell mode run has no services and therefore no containers. GMT disables every configured provider whose name ends in `_container` for such a run and stores a warning for each of them.

Only providers with the scopes `system`, `component` and `machine` deliver data. Examples from the `config.yml.example` are:

- `cpu_utilization_procfs_system`
- `memory_used_procfs_system`
- `cpu_energy_rapl_msr_component`
- `memory_energy_rapl_msr_component`
- `psu_energy_ac_mcp_machine`
- `carbon_intensity_static_machine`

These providers measure the whole machine and not only your command.

## Usage

Activate the venv and pass the command after `--`.

```bash
cd PATH_TO_GREEN_METRICS_TOOL
source venv/bin/activate
./shell.py -- 'echo "Hello" && sleep 10'
```

More examples:

```bash
# Give the run a name that shows up in the Dashboard
./shell.py --name "stress-ng one core" -- 'stress-ng -c 1 -t 5 -q'

# Stop the command after 60 seconds
./shell.py --measurement-flow-process-duration 60 -- './build.sh'

# Use PowerShell instead of bash
./shell.py --shell-executable pwsh -- 'Get-ChildItem -Recurse | Measure-Object'

# Measure, but write nothing to the database
./shell.py --dev-no-save -- 'curl -s https://example.com > /dev/null'
```

### Always use `--` and quote the command

Everything after `--` is taken as the command. Always use it.

Without `--` the argument parser of `shell.py` looks at the whole command line first. Options in your command that match a `shell.py` switch, or an abbreviation of one, are then taken by `shell.py` and removed from your command. For example `./shell.py curl --verbose https://example.com` turns on `--verbose-provider-boot` and only runs `curl https://example.com`. If the first unknown argument starts with `-`, `shell.py` stops with an error and shows you the same command in the `--` form.

Put the whole command into single quotes when it contains pipes, redirects, `&&`, `;` or variables. If you pass a single argument, `shell.py` uses it unchanged as the command. If you pass several arguments, `shell.py` joins them into one command line and quotes them where needed. On Linux and macOS shell operators that are passed as separate arguments are quoted as well and are thus treated as plain text. Operators that are not quoted at all are already interpreted by your own terminal shell before `shell.py` sees them.

If no command is given, `shell.py` prints its help and exits.

### Working directory and environment

The command runs in the directory from which you start `shell.py`. GMT stores this directory as the URI of the run. The command runs with the permissions and the environment of the user that started `shell.py`.

## How the command is executed

The command runs in the shell given by `--shell-executable`. The default is `bash`. On Windows the default is `powershell`.

GMT applies strict shell options so that errors in your command do not go unnoticed. Which options are used depends on the type of shell.

- **POSIX shells** (`bash`, `zsh`, `sh` and every shell that is not PowerShell or cmd): The command is called as `SHELL -o errexit -o nounset -o pipefail -c 'COMMAND'`.
    + `errexit` stops at the first command that fails
    + `nounset` treats the use of an unset variable as an error
    + `pipefail` makes a pipeline fail when any part of it fails
- **PowerShell** (`powershell` or `pwsh`): The command is called with `-NoProfile -NonInteractive -Command`. GMT puts `$ErrorActionPreference = 'Stop'` and `Set-StrictMode -Version Latest` in front of your command. PowerShell has no equivalent for `pipefail`.
- **cmd**: The command is called as `cmd /d /s /c COMMAND`. cmd cannot express these options, so none are applied.

`shell.py` has no switch to change these options. If your shell does not support them, the run fails with an error message that explains this and notes that your command was possibly not executed at all. If you need different options, write a small `usage_scenario.yml` with a host flow and set `shell-options` for the command (see [Host flows in a usage_scenario.yml](#host-flows-in-a-usage_scenarioyml)).

If the command exits with a non-zero exit code, GMT marks the run as failed.

The output of the command is captured and not streamed live. GMT prints stdout and stderr after the command has finished and stores them in the logs of the run.

## Switches

- `--name` A name which will be stored in the database to discern this run from others
    + If omitted, the run is called `Run` followed by the current date and time
- `--user-id` Execute the run as a specific user (Default: 1)
    + The user needs the `host` orchestrator capability. See [Host execution capability](#host-execution-capability)
- `--config-override` Use a different configuration file instead of `config.yml`
    + Pass the full path. The file must end in `.yml`
- `--file-cleanup` Delete the GMT temporary folder (`/tmp/green-metrics-tool`, or the system temp directory on Windows) after the run
- `--verbose-provider-boot` Boot the metric providers one after another
    + GMT adds a note for each provider and sleeps 10 seconds after each provider boot
- `--shell-executable` The shell that runs the command (Default: `bash`, on Windows `powershell`)
    + See [How the command is executed](#how-the-command-is-executed)
- `--measurement-flow-process-duration` Maximum runtime of the command in seconds
    + If the command runs longer, it is stopped and `shell.py` exits with code `124`
    + If omitted, there is no limit

#### Development switches with possible side effects

These behave like the switches with the same name in [runner.py →]({{< relref "/docs/measuring/runner-switches.md" >}}).

- `--dev-no-metrics` Skips loading the metric providers. Runs will be faster, but you will have no metrics
- `--dev-no-phase-stats` Do not calculate phase stats
- `--dev-no-save` Will save no data to the database
- `--dev-no-sleeps` Removes all sleeps. Resulting measurement data will be skewed.

All other `runner.py` switches, for instance `--iterations`, `--variable`, `--print-logs` or `--debug`, are not available in shell mode.

## Fixed settings

Shell mode is a quick tool, so some settings are fixed and cannot be changed.

- The analysis for optimizations is skipped
- All system checks are skipped
- No container dependency information is collected
- No GMT dependencies (like Kaniko) are downloaded
- There is no repository checkout. The run gets the branch and author `[SHELL]`
- The check for running containers, the Docker network setup and the Docker image cleanup are skipped. Since there are no services, no images are built and no containers are started
- The measurement phases are kept short

| Setting | Shell mode | runner.py default |
|---|---|---|
| Sleep before the measurement starts | 1 s | 5 s |
| `[BASELINE]` duration | 5 s | 60 s |
| `[IDLE]` duration | 5 s | 60 s |
| Sleep after the measurement | 1 s | 5 s |

A shell mode run still goes through all the usual phases. Your command runs inside the `[RUNTIME]` phase in a sub phase called **Shell Command**. `[INSTALLATION]` and `[BOOT]` have nothing to do and therefore stay short.

Because system checks and container dependency collection are switched off through development switches, every shell mode run carries the warning that development switches were active.

## Output

After a successful run `shell.py` prints a table with the phase stats of the **Shell Command** phase. The columns are `metric`, `detail`, `type`, `value`, `unit`, `max` and `min`. The table is not printed when `--dev-no-metrics` or `--dev-no-phase-stats` is set.

Then it prints the link to the full report in the Dashboard. The link is built from `cluster.metrics_url` in your `config.yml`.

```txt
Phase stats summary:
metric | detail | type | value | unit | max | min
...

Please access your report on the URL METRICS_URL/stats.html?id=RUN_ID
```

With `--dev-no-save` nothing is written to the database. In this case `shell.py` only prints that the run has finished and shows neither the table nor a link.

### Exit codes

- `0` The run finished successfully
- `1` The run failed. This includes a command that exited with a non-zero exit code, a missing host permission, a config override that could not be loaded and a call without a command
- `2` The argument parser rejected the arguments, for instance an unknown option before the command
- `124` The command exceeded `--measurement-flow-process-duration`
- `127` A file or executable was not found, for instance the shell given in `--shell-executable`
- `130` The run was aborted with Ctrl+C

If a helper process that GMT calls internally fails, `shell.py` exits with the exit code of that process.

A command that is not found inside the shell does not lead to `127`. The shell reports it as a failed command and `shell.py` exits with `1`.

Errors are printed to stderr. Unless `--dev-no-save` is set, they are also written to the error file configured in `config.yml` and to the system logs in the database.

## Secrets in commands

{{< callout context="caution" icon="outline/alert-triangle" >}}
The command is stored with the run. It ends up in the stored runner arguments, in the description and the flow of the stored usage scenario and in the logs. `shell.py` reminds you of this on every start. If your command contains passwords, tokens or other secrets, use `--dev-no-save`.
{{< /callout >}}

With `--dev-no-save` nothing about the run is written to the database, and errors are only printed to the terminal. `shell.py` has no switch for usage scenario variables, so the encrypted `__GMT_VAR_SECRET_*__` variables of normal runs are not available in shell mode.

## Host execution capability

Running commands directly on the host is security sensitive. GMT therefore only allows it for users that have the `host` orchestrator in their capabilities, stored under `measurement.orchestrators.host`. The key only has to exist. Its value is an empty object.

```json
"measurement": {
    "orchestrators": {
        "docker": {
            "allowed_run_args": []
        },
        "host": {}
    }
}
```

Only the default user with the ID 1 gets this capability, through the seed data on new installations and through a migration on existing ones. All other users do not have it.

If the user does not have the capability, the run stops with a `PermissionError` before the metric providers are started. This applies to `shell.py` and to every usage scenario that contains a host flow.

On a cluster you might not want to allow host execution at all. You can remove the capability from user 1 again with:

```sql
UPDATE users SET capabilities = capabilities #- '{measurement,orchestrators,host}' WHERE id = 1;
```

See [User Management →]({{< relref "/docs/cluster/user-management.md" >}}) for how capabilities work.

## Host flows in a usage_scenario.yml

Shell mode is only a shortcut. You can also run flows directly on the host in a normal `usage_scenario.yml` by setting `container: null` for a flow.

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

  - name: Host Shell
    container: null
    commands:
      - type: console
        command: echo "hello" && echo "world"
        shell: bash
```

The same rules as in shell mode apply.

- The user needs the `host` orchestrator capability
- Host flows only support commands of type `console`
- With `shell` the command runs in that shell with the strict shell options described above. You can change them with `shell-options`
- Without `shell` the command is split into its arguments and executed directly without a shell
- GMT stores a warning that the commands are not sandboxed and that the data is not directly comparable to fully containerized runs
- Notes and logs of host flows are shown under the name `[HOST]`
- If the scenario has no `services`, all `*_container` metric providers are disabled

Host flows and container flows can be mixed in the same scenario. See [usage_scenario.yml →]({{< relref "/docs/measuring/usage-scenario.md" >}}) for the full syntax.
