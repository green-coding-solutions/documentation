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
  + If given a URL starting with `http(s)` the tool will try to clone a remote repository to `/tmp/green-metrics-tool/repo`
  + If given a local directory starting with `/`, this will be used instead.
- `--branch` When providing a git repository, optionally specify a branch
- `--filename` An optional alternative filename if you do not want to use "usage_scenario.yml"
  + Multiple filenames can be provided, e.g. `--filename A.yml --filename B.yml` (both scenarios are executed sequentially)
    * Duplicated filenames are allowed (if you want to repeat the same file(s) multiple times, consider using `--iterations`)
  + Relative paths are supported, e.g. "../usage_scenario.yml"
  + Wildcard characters '\*' and '?' are supported, e.g. "*.yml" (all yml files in the current directory are executed sequentially)
- `--variables` A list of string key-value pairs with variables to be replaced in the [usage_scenario.yml →]({{< relref "usage-scenario" >}})
  + e.g.: `--variables '__GMT_VAR_MY_VALUE_=cats are cool'`
- `--commit-hash-folder` Use a different folder than the repository root to determine the commit hash for the run
- `--user-id` Execute run as a specific user (Default: 1) - See also [User Management →]({{< relref "/docs/cluster/user-management.md" >}})
- `--config-override` Override the configuration file with the passed in yml file.
  + Must be located in the same directory as the regular configuration file. Pass in only the name.
- `--file-cleanup` flag to delete the metric provider data in `/tmp/green-metrics-tool`. Normally this folder is only purged on a new run start and files are left in `/tmp/green-metrics-tool`.
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
- `--skip-system-checks` Skip checking the system if the GMT can run
- `--verbose-provider-boot` flag to boot metric providers gradually
  + This will enable the user to see the impact of each metric provider more clearly in the metric timelines
  + There will be a 10 second sleep after each provider boot
  + `RAPL` metric providers will be prioritized to start first, if enabled
- `--full-docker-prune` Stop and remove all containers, build caches, volumes and images on the system
- `--docker-prune` Prune all unassociated build caches, networks volumes and stopped containers on the system
- `--skip-volume-inspect` Disable docker volume inspection. Can help if you encounter permission issues.
- `--dev-flow-timetravel` Allows to repeat a failed flow or timetravel to beginning of flows.
  + Note that process logging, SCI calculations, and notes extraction may be incomplete in timetravel mode
- `--dev-no-metrics` Skips loading the metric providers. Runs will be faster, but you will have no metric
- `--dev-no-sleeps` Removes all sleeps. Resulting measurement data will be skewed.
- `--dev-no-phase-stats` Do not calculate phase stats.
- `--dev-no-save` Will save no data to the DB. This implicitly activates `--dev-no-phase-stats`, `--dev-no-metrics` and `--dev-no-optimizations`
- `--dev-cache-build` Checks if a container image is already in the local cache and will then not build it. Also doesn't clear the images after a run. Please note that skipping builds only works the second time you make a run since the image has to be built at least initially to work.
- `--dev-no-optimizations` Disables the creation of potential optimization recommendations based on the measurement run.
- `--print-phase-stats PHASE_NAME` Prints the stats of the given phase to the CLI. Typical argument would be "\[RUNTIME\]" to see all runtime phases combined
- `--print-logs` Prints the container and process logs to stdout
- `--iterations` Specify how many times each scenario should be executed (Default: 1)
  + With multiple files (see `--filename`), all files are processed sequentially, then the entire sequence is repeated N times
    * Example: with files A.yml, B.yml and `--iterations 2`, the execution order is A, B, A, B.

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
