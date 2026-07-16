---
title : "runner.py switches"
description: ""
date: 2023-07-05T08:48:45+00:00
weight: 430
toc: false
---

Apart from the `config.yml` some additional configuration is possible when manually running with the `runner.py`.

- `--name` A name which will be stored to the database to discern this run from others
- `--uri` The URI to get the usage_scenario.yml from.
    + If given a URL starting with `http://`, `https://`, `ssh://` or `git@` the tool will try to clone a remote repository to `/tmp/green-metrics-tool/repo`
    + Any other value is treated as a local directory and must already exist. Both absolute and relative paths are supported.
- `--branch` When providing a git repository, optionally specify a branch
- `--commit-hash` When providing a git repository, optionally specify a commit hash to check out
- `--filename` An optional alternative filename if you do not want to use "usage_scenario.yml"
    + Multiple filenames can be provided, e.g. `--filename A.yml --filename B.yml` (both scenarios are executed sequentially)
        * Duplicated filenames are allowed (if you want to repeat the same file(s) multiple times, consider using `--iterations`)
    + Relative paths are supported, e.g. "../usage_scenario.yml"
    + Wildcard characters '\*' and '?' are supported, e.g. "*.yml" (all yml files in the current directory are executed sequentially)
- `--variable` A key-value pair with a variable to be replaced in the [usage_scenario.yml →]({{< relref "usage-scenario" >}})
    + e.g.: `--variable '__GMT_VAR_MY_VALUE__=cats are cool'`
    + The name must match `__GMT_VAR_[\w]+__`, so note the two leading and the two trailing underscores
    + Can be used multiple times if more than one variable shall be submitted
- `--iterations` Specify how many times each scenario should be executed (Default: 1)
    + With multiple files (see `--filename`), all files are processed sequentially, then the entire sequence is repeated N times
        * Example: with files A.yml, B.yml and `--iterations 2`, the execution order is A, B, A, B.
- `--carbon-simulation` The grid intensity to assume when running the job.
    + Can be an integer, which will be applied to the whole run
    + Can be a list of integers, which will be sent to *Elephant*
    + Can be a UUID, which will be used as the simulation id for *Elephant*
- `--category` A category id to store for this run. Can be used multiple times if the run shall be in more than one category
- `--commit-hash-folder` Use a different folder than the repository root to determine the commit hash for the run
- `--user-id` Execute run as a specific user (Default: 1) - See also [User Management →]({{< relref "/docs/cluster/user-management.md" >}})
- `--ssh-private-key` Path to a file on your system that holds an SSH private key. Needed to check out private repositories
    + Please supply an SSH URL (`ssh://` or `git@`) in `--uri` when using a private key
- `--docker-credentials` Path to a JSON file with docker registry credentials, so that images from private registries can be pulled
    + Format: `[{"registry":"...","username":"...","password":"..."}]`
- `--config-override` Override the configuration file with the passed in yml file.
    + Supply the full path. The file must end in `.yml`.
- `--file-cleanup` flag to delete the metric provider data in `/tmp/green-metrics-tool`. Normally this folder is only purged on a new run start and files are left in `/tmp/green-metrics-tool`.
- `--debug` flag to activate steppable debug mode
    + This allows you to enter the containers and debug them if necessary.
- `--allow-unsafe` flag to activate unsafe volume bindings, ports, and complex env vars
    + Arbitrary volume bindings into the containers. The volume spec is handed to `docker run -v` as given, so **read-write mounts are possible**. Read-only is only enforced when running *without* this flag.
        * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **volumes** option for details
    + Port mappings to the host OS.
        * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **ports** option for details
    + Non-Strict ENV vars mapped into container
        * See [usage_scenario.yml →]({{< relref "usage-scenario" >}}) **environment** option for details
    + Non-Strict labels mapped into container
    + Joining the Docker `host` network, which is otherwise restricted
    + Bypasses the `allowed_run_args` allow list for **docker-run-args**
- `--verbose-provider-boot` flag to boot metric providers gradually
    + This will enable the user to see the impact of each metric provider more clearly in the metric timelines
    + There will be a 10 second sleep after each provider boot
    + `RAPL` metric providers will be prioritized to start first, if enabled
- `--full-docker-prune` Stop and remove all containers, build caches, volumes and images on the system
- `--docker-prune` Prune all unassociated build caches, networks volumes and stopped containers on the system
- `--print-phase-stats PHASE_NAME` Prints the stats of the given phase to the CLI. Typical argument would be "\[RUNTIME\]" to see all runtime phases combined
- `--print-logs` Prints the container and process logs to stdout

#### Measurement settings

These switches tune the timings and thresholds of a measurement run. All of them take an integer value.

When running in cron / cluster-client mode these values are not taken from the CLI, but from the
[User Settings →]({{< relref "configuration#user-settings" >}}) of the user the run is mapped to.

Beware that changing the durations and sleeps makes your runs uncomparable to runs measured with different values.

- `--measurement-system-check-threshold` When to issue a warning and when to fail on system checks (Default: 3)
    + Can be 1=INFO, 2=WARN or 3=ERROR. When set to 3 runs will fail only on errors, when 2 then also on warnings and when 1 also on pure info statements.
- `--measurement-pre-test-sleep` Sleep in seconds before the measurement starts (Default: 5)
- `--measurement-baseline-duration` Duration in seconds of the baseline phase (Default: 60)
- `--measurement-idle-duration` Duration in seconds of the idle phase (Default: 60)
- `--measurement-post-test-sleep` Sleep in seconds after the measurement has finished (Default: 5)
- `--measurement-phase-transition-time` Time in seconds that is waited between two phases (Default: 1)
- `--measurement-wait-time-dependencies` Max. time in seconds to wait for a `depends_on` dependency to become ready (Default: 60)
- `--measurement-flow-process-duration` Max. duration in seconds for how long one synchronous process in a flow may take. A Timeout-Exception is thrown if exceeded (Default: 86400)
- `--measurement-total-duration` Max. duration in seconds for how long the whole run may take, including building containers, baseline, idle, runtime and removal phases (Default: 86400)

#### Development switches without side effects

These switches do not alter proper measurements, but might result in data not being generated.
They can speed up runs by omitting non-critical checks or creation of optional data.

- `--skip-optimizations` Skips the creation of potential optimization recommendations based on the measurement run.
- `--skip-volume-inspect` Disable docker volume inspection. Can help if you encounter permission issues.
- `--skip-download-dependencies` Skip downloading GMT dependencies like Kaniko etc. Useful to speed up runs if your dependencies are up to date.
- `--skip-unsafe` flag to skip unsafe volume bindings, ports and complex env vars
    + This is typically done when reusing already present `compose.yml` files without the need to alter the file

#### Development switches with possible side effects

These switches may break or skew proper measurements or make them uncomparable due to missing info.
However many of them are useful to speed up runs and aide in iterative development / debugging.

- `--dev-no-system-checks` Do not check the system if the GMT can run properly
- `--dev-no-metrics` Skips loading the metric providers. Runs will be faster, but you will have no metric
- `--dev-no-sleeps` Removes all sleeps. Resulting measurement data will be skewed.
- `--dev-no-phase-stats` Do not calculate phase stats.
- `--dev-no-save` Will save no data to the DB. This implicitly activates `--dev-no-phase-stats`, `--dev-no-metrics` and `--skip-optimizations`
- `--dev-no-container-dependency-collection` Do not collect container dependency information of started containers
- `--dev-no-resource-limits` Disable setting of resource limits per container. See [Resource Limits →]({{< relref "resource-limits" >}}) for what is skipped.
- `--dev-cache-build` Checks if a container image is already in the local cache and will then not build it. Also doesn't clear the images after a run. Please note that skipping builds only works the second time you make a run since the image has to be built at least initially to work.
- `--dev-cache-repos` Do not clone the repository and the relations again, but use the ones already present on disk. Cannot be combined with `--file-cleanup`.
- `--dev-stream-outputs` Stream the output of the container build and the called processes in flows and setup-commands to the terminal. Note that this disallows capturing of errors and build outputs in logs and error messages.
- `--dev-flow-timetravel` Allows to repeat a failed flow or timetravel to beginning of flows.
    + Note that process logging, SCI calculations, and notes extraction may be incomplete in timetravel mode

These options are not available when doing cron runs.

## Typical calls

### Local app

```bash
python3 runner.py --uri PATH_TO_MY_SAMPLE_APP_FOLDER --name "MY_NAME"
```

### GitHub repository

```bash
python3 runner.py --uri https://github.com/MY_GITHUB_NAME/MY_REPO --name "MY_NAME"
```
