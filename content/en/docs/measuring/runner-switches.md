---
title : "runner.py switches"
description: ""
lead: ""
date: 2023-07-05T08:48:45+00:00
weight: 830
---

Apart from the `config.yml` some configuration is additionally possible when doing manual runs
with the `runner.py`.

- `--uri` The URI to get the usage_scenario.yml from.
  + If given a URL starting with `http(s)` the tool will try to clone a remote repository to `/tmp/green-metrics-tool/repo`
  + If given a local directory starting with `/`, this will be used instead.
- `--branch` When providing a git repository, optionally specify a branch
- `--name` A name which will be stored to the database to discern this run from others
- `--filename` An optional alternative filename if you do not want to use "usage_scenario.yml"
- `--config-override` Override the configuration file with the passed in yml file.  
  + Must be located in the same directory as the regular configuration file. Pass in only the name.
- `--no-file-cleanup` flag to not delete the metric provider data in `/tmp/green-metrics-tool`
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
- `--skip-config-check` Skip checking the configuration
- `--verbose-provider-boot` flag to boot metric providers gradually
  + This will enable the user to see the impact of each metric provider more clearly
  + There will be a 10 second sleep for two seconds after each provider boot
  + `RAPL` metric providers will be prioritized to start first, if enabled
- `--full-docker-prune` Prune all images and build caches on the system
- `--dry-run` Removes all sleeps. Resulting measurement data will be skewed.
- `--dev-repeat-run` Checks if a docker image is already in the local cache and will then not build it.
  + Also doesn't clear the images after a run

These options are not available when doing cron runs.

## Typical calls

### Local app

```console
python3 runner.py --uri PATH_TO_MY_SAMPLE_APP_FOLDER --name MY_NAME`
```

### Github repository

```console
python3 runner.py --uri https://github.com/MY_GITHUB_NAME/MY_REPO --name MY_NAME
```