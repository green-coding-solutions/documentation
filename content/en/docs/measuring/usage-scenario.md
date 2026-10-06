---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
date: 2022-06-16T08:48:45+00:00
weight: 415
---

The `usage_scenario.yml` consists of these main blocks:

- Start of the file with some basic root level keys
- `services` - Handles the orchestration of containers
- `flow` - Handles the interaction with the containers (or with the host, see [Flows on the host](#flows-on-the-host))
- `compose-file` - (optional) A compose file to include
- `relations` - (optional) Additional repositories to check out
- `networks` - (optional) Handles the orchestration of networks
- `custom_metrics` - (optional) Handles Custom Metrics and SCI

Its format is an extended subset of the [Docker Compose Specification](https://docs.docker.com/compose/compose-file/), which means that we keep the same format, but disallow some options and also add some exclusive options to our tool. However, keys that have the same name are also identical in function - thought potentially with some limitations.
See also the note on [unsupported features](#unsupported-docker-compose-features) to disable the warning about that.

Inside the `usage_scenario.yml` you can use variables. See [variables](#variables) for details.

### Basic root level keys

Example for the start of a `usage_scenario.yml`

```yaml
---
name: My Hugo Test
author: Arne Tarara <arne@green-coding.io>
description: This is just an example usage_scenario ...
```

- `name` **[str]**: Name of the scenario
- `description` **[str]**: Detailed description of the scenario
- `author` **[str]**: Author of the scenario
- `architecture` **[str]** *(optional)*: If your *usage_scenario* runs only on a specific architecture you can instruct the GMT to check if the architecture of the machine matches. You can specify **Linux**, **Windows** and **Darwin**. Omit this key if your scenario has no architecture restriction.
    + Note: Windows with WSL2 and Linux containers would be **Linux** as architecture
- `ignore-unsupported-compose` **[bool]** *(optional)*: Ignore unsupported [Docker Compose](https://docs.docker.com/compose/compose-file) features and still run usage_scenario

Please note that when running the measurement you can supply an additional name,
which can and should be different from the name in the `usage_scenario.yml`.

The idea is to have a general name for the `usage_scenario.yml` and another one for the specific measurement run.

When running the `runner.py` we would then set `--name` for instance to: *Hugo Test run on my Macbook*

### Services

Example:

```yaml
services:
  gcb-wordpress-mariadb:
    image: gcb_wordpress_mariadb
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    ports:
      - 3306:3306
    setup-commands:
      - command: sleep 20
    volumes:
      - /LOCAL/PATH:/PATH/IN/CONTAINER
    networks:
      - wordpress-mariadb-data-green-coding-network
    healthcheck:
      test: curl -f http://nc
      interval: "30s"
      timeout: "10s"
      retries: 10
      start_period: "10s"
      disable: False
  gcb-wordpress-apache:
    # ...
    depends_on:
      gcb-wordpress-mariadb:
        condition: service_healthy
  gcb-wordpress-dummy:
    # ...
    depends_on:
      - gcb-wordpress-mariadb
```

- `services` **[dict]**: (Dictionary of container dictionaries for orchestration)
    + `[CONTAINER]:` **[a-zA-Z0-9_]** The name of the container/service
    + `image:` **[str]** Docker image identifier. If `build` is not provided the image needs to be accessible locally on Docker Hub. If `build` is provided it is used as identifier for the image.
    + `build:` **[str]** *(optional)* Path to build context. See `context` for restrictions. Default for `dockerfile` is `Dockerfile`. Alternatively, you can provide more detailed build information with:
        - `context:` **[str]** *(optional)* Path to the build context. Needs to be in the path or repo that is passed with `--uri` to `runner.py`. Default: `.`.
        - `dockerfile:` **[str]** *(optional)* Path to Dockerfile. Needs to be in `context`. Default: `Dockerfile`.
        - `target:` **[str]** *(optional)* Name of the stage in a multi-stage Dockerfile that shall be built and used as the image of the service. It is passed to Kaniko as `--target`. Allowed characters are `[A-Za-z0-9_.-]` and the name must start with a letter or digit.
        - All images that GMT builds in one run share a Kaniko layer cache. Services that use the same base image or the same stages of a Dockerfile can therefore reuse already built layers. The cache is a Docker volume that GMT removes at the start and at the end of every run, unless `runner.py` is called with `--dev-cache-build`.
    + `container_name:` **[a-zA-Z0-9_]** *(optional)* With this key you can overwrite the name of the container. If not given, the defined service name above is used as the name of the container.
    + `environment:` **[dict|list]** *(optional)*
        - Either Key-Value pairs for ENV variables inside the container
        - Or list items with strings in the format: *MYSQL_PASSWORD=123*
    + `ports:` **[int:int]** *(optional)*
        - Docker container portmapping on host OS to be used with `--allow-unsafe` flag.
    + `init:` **[boolean]**
        - Will start a PID 1 *init* process in the container that helps when you are experiencing zombie processes and memory leaks. See [Docker Docs](https://docs.docker.com/reference/cli/docker/container/run/#init) for details
    + `depends_on:` **[list|dict]** *(optional)*
        - Can either be an list of services names on which the service is dependent. It affects the startup order and forces the dependency to be started (container state = "running") before the service is started.
        - Or it can be an dict where you can specify a condition. The `condition` can have two values:
        * `service_healthy`: Will wait for the container until the docker *healthcheck* returns *healthy*.
        * `service_started`: Similar to the list syntax -> this will enforce a starting order and just wait until the container state is "running".
    - `setup-commands:` **[list]** *(optional)*
        - List of commands to be run before actual load testing. Mostly installs will be done here. Note that your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin
        - `command:` **[str]**
        * The command to be executed
        - `shell:` **[str]** *(optional)*
        * Will execute the `setup-commands` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
        ** Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
        * GMT runs the command as `SHELL -o errexit -o nounset -o pipefail -c COMMAND`. The command thus fails on the first failing sub-command, on unset variables and on failures inside a pipe. See [Strict shell options](#strict-shell-options) for details.
        - `shell-options:` **[str|list]** *(optional)*
        * Replaces the default options `-o errexit -o nounset -o pipefail` for this command. Can only be used together with `shell`. See [Strict shell options](#strict-shell-options).
    - `volumes:` **[list]**  *(optional)*
        - List of volumes to be mapped. Only read if `runner.py` is executed with `--allow-unsafe` flag
    - `networks:` **[list]**  *(optional)*
        - The networks to put the container into. If no networks are defined throughout the `usage_scenario.yml` the container will be put into the default network will all others in the file.
    - `healthcheck:` **[dict]** *(optional)*
        - Please see the definition of these arguments and how healthcheck works in the official docker compose definition. We just copy them over: [Docker compose healthcheck specification](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)
        - `test:` **[str|list]**
        - `interval:` **[str]**
        - `timeout:` **[str]**
        - `retries:` **[integer]**
        - `start_period:` **[str]**
        - `disable:` **[boolean]**
    - `folder-destination`: **[str]** *(optional)*
        - Specify where the project that is being measured will be mounted inside of the container
        - Defaults to `/tmp/repo`
    - `command:` **[str]** *(optional)*
        - Command to be executed when container is started. When container does not have a daemon running typically a shell is started here to have the container running like `bash` or `sh`.
    - `entrypoint:` **[str]** *(optional)*
        - Declares the default entrypoint for the service container. This overrides the ENTRYPOINT instruction from the service's Dockerfile.
        - The value of `entrypoint` can either be an empty string (ENTRYPOINT instruction will be ignored) or a single word (helpful to provide a script).
        - If you need an entrypoint that consists of multiple commands/arguments, either provide a script (e.g. `entrypoint.sh`) or set it to an empty string and provide your commands via `command`.
    - `log-stdout:` **[boolean]** *(optional, default: `true`)*
        - Will log the *stdout* of the container and make it available through the frontend in the *Logs* tab.
        - Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `log-stderr:` **[boolean]** *(optional, default: `true`)*
        - Will log the *stderr* of the container and make it available through the frontend in the *Logs* tab and in error messages.
        - Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `read-notes-stdout:` **[bool]** *(optional)*
        - Read notes from *stdout* of the container.
        - Most likely you do not need this, as it also requires customization of your application (writing of a log message in a specific format). It may be helpful if your application has asynchronous operations and you want to know when they have finished. In most cases, it is more appropriate to read the notes from the command's *stdout* in your flow (see below).
        - Note that `log-stdout` has to be enabled (it is the default).
        - Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).
    - `docker-run-args:` **[list]** *(optional)*
        - A list of string that should be added to the `docker run` command of that container.
        - The argument needs to be listed in the `user.capabilities` json under `measurement:orchestrators:docker:allow-args`. The string in the `user.capabilities` can be a regex. Opening this up could be a potential security issue!

Please note that every key below `services` will serve as the name of the
container later on. You can overwrite the container name with the key `container_name`.

### Relations

```yml
relations:
  server: # will be put in /tmp/relations/server
    url: https://github.com/nextcloud/server
    branch: master
    # no commit hash given means HEAD is checked out
  k6:
    url: https://github.com/grafana/k6
    branch: main
    commit_hash: 352991e5acdf50728a7c8ea7350c33d0de65dfc1
```

Often it is needed to have additional repositories checked out that you do not want to include in your core repository.

Example: Your software is a HTTP server and you include the benchmarks in your repository. However you need *k6* as a
helper library also somewhere present.

You can of course include it as a service. But sometimes it is needed to have the repository available for building some
stuff or for supplementing your services.

Relations are checked out at a specific branch and revision that you specify. If you do not specify a revision HEAD
is always checked out.

All relations are mounted into every container at the mountpoint `/tmp/relations/X` whereas *X* represesents the key the
relations object from your *usage_scenario.yml* file.

- `relations:` **[dict]** (Dictionary of relations, aka additional git repositories, to check out)
    + `KEY:` **[a-zA-Z0-9_]** The name of the relation. Will later be the location in `/tmp/relation/KEY` of the container
        - `url:` **URL** URL of the repository. Technically can also be SSH URI if you have the git client configured to send credentials. No filesystem paths are allowed though as usage_scenario.yml files should be transportable to different systems and shareable.
        - `branch:` **Allowed git branch characters**: The branch to check out for the git repository
        - `commit_hash:` **SHA-1 hash**: The revision to check out. HEAD if not specified


### Networks

Example:

```yaml
networks:
  name: wordpress-mariadb-data-green-coding-network
```

- `networks:` **[dict]** (Dictionary of network dictionaries for orchestration)
    + `name: [NETWORK]` **[a-zA-Z0-9_]** The name of the network with a trailing colon. No value required.

### Flow

Example:

```yaml
flow:
  - name: Check Website
    container: green-coding-puppeteer-container
    commands:
    - type: console
      command: node /var/www/puppeteer-flow.js
      note: Starting Puppeteer Flow
      read-notes-stdout: true
    - type: console
      command: sleep 30
      note: Idling
    - type: console
      command: node /var/www/puppeteer-flow.js
      note: Starting Puppeteer Flow again
      read-notes-stdout: true
  - name: Shutdown DB
    container: database-container
    commands:
      - type: console
      command: killall postgres
```

- `flow:` **[list]** (List of flows to interact with containers)
    + `name:` **[\.\s0-9a-zA-Z_\(\)-]+** An arbitrary name, that helps you distinguish later on where the load happend in the chart
    + `container:` **\[a-zA-Z0-9\]\[a-zA-Z0-9_.-\]+|null** The name of the container in which you want to run the flow
        - The value must be the name of a container defined in `services`. This is the `container_name` of the service if it is set, otherwise the key of the service. GMT validates this before the run and aborts if the flow references an unknown container.
        - Set it to `null` (or leave the value empty) to run the flow directly on the host. See [Flows on the host](#flows-on-the-host).
    + `hidden:` **true** Minimizes a flow set in the frontend
    + `commands:` **[list]**
    + `type:` **[console|playwright]**
        - `console` will execute a shell command inside the container (or on the host for flows with `container: null`)
        - `playwright` will execute the playwright command in the container. See the [documentation](/docs/measuring/playwright/) for more details.
    + `command:` **[str]**
        - The command to be executed. If type is `console` then piping or moving to background is not supported.
    + `detach:` **[bool]** (optional, default: `false`)
        - When the command is detached it will get sent to the background. This allows to run commands in parallel if needed, for instance if you want to stress the DB in parallel with a web request
    + `note:` **[str]** *(optional)*
        - A string that will appear as note attached to the datapoint of measurement (optional)
    + `ignore-errors:` **[bool]** *(optional)*
        - If set to `true` the run will not fail if the process in `command` has a different exit code than `0`. Useful
           if you execute a command that you know will always fail like `timeout 0.1 stress -c 1`
    + `shell:` **[str]** *(optional)*
        - Will execute the `command` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
        - Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
        - For `console` commands GMT runs the command as `SHELL -o errexit -o nounset -o pipefail -c COMMAND`. See [Strict shell options](#strict-shell-options) for details.
    + `shell-options:` **[str|list]** *(optional)*
        - Replaces the default shell options for this command. Can only be used together with `shell` and only for commands of type `console`. See [Strict shell options](#strict-shell-options).
    + `log-stdout:` **[boolean]** *(optional, default: `true`)*
        - Will log the *stdout* of the command and make it available through the frontend in the *Logs* tab.
        - Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    + `log-stderr:` **[boolean]** *(optional, default: `true`)*
        - Will log the *stderr* of the command and make it available through the frontend in the *Logs* tab and in error messages.
        - Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    + `read-notes-stdout:` **[bool]** *(optional)*
        - Read notes from the *stdout* of the command.
        - This is helpful if you have a long running command that does multiple steps and you want to log every step.
        - Note that `log-stdout` has to be enabled (it is the default).
        - Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).

#### Flows on the host

A flow with `container: null` (or an empty `container:` key) runs its commands directly on the host system instead of inside a container.

```yaml
flow:
  - name: Compile on host
    container: null
    commands:
      - type: console
        command: make -j4
        shell: bash
```

- Host flows only support commands of type `console`.
- The user that runs the measurement needs the `measurement.orchestrators.host` capability. Otherwise the run aborts with a `PermissionError`. On a fresh installation the DEFAULT user (id 1) has this capability. See [User Management →]({{< relref "/docs/cluster/user-management.md" >}}).
- GMT adds a warning to the run, because the commands are not sandboxed and the measurement data is not directly comparable to fully containerized runs.
- Without `shell` the command is split like a command line and executed directly. With `shell` it is executed in that shell with the [strict shell options](#strict-shell-options).
- `services` is optional. If the `usage_scenario.yml` has no services, GMT disables all metric providers that need containers (the ones ending in `_container`, for example `cpu_utilization_cgroup_container`) and adds a warning for each of them.

If you only want to measure a single command on the host you do not need a `usage_scenario.yml` at all. See [Shell mode →]({{< relref "/docs/measuring/shell-mode.md" >}}).

#### Strict shell options

Every `console` command and every setup-command that has a `shell` is started with these options by default:

```bash
SHELL -o errexit -o nounset -o pipefail -c COMMAND
```

- `errexit` stops the command at the first sub-command that fails
- `nounset` treats the use of an unset variable as an error
- `pipefail` makes a pipe fail if any command in it fails, not only the last one

This way errors in your commands cannot go unnoticed.

Some shells do not support all of these options. A common case is `dash`, which is `/bin/sh` in Debian and Ubuntu based images and has no `pipefail`. GMT then aborts the run and tells you that the used shell does not support the shell options. See [Troubleshooting →]({{< relref "/docs/help/troubleshooting#the-used-shell-does-not-support-the-shell-options" >}}). Either use a shell that supports them, like `bash`, or set `shell-options` for the command.

`shell-options` replaces the default options for a single command:

- A string is split like a command line, for example `-o errexit -o pipefail`
- A list is used as it is, for example `['-o', 'errexit']`
- An empty list (`shell-options: []`) disables all options. Errors in your command may then go unnoticed.

```yaml
flow:
  - name: Stress
    container: test-container
    commands:
      - type: console
        command: stress-ng -c 1 -t 1 -q
        shell: bash
        shell-options: -o errexit -o pipefail
      - type: console
        command: echo 1
        shell: sh
        shell-options: []
```

`shell-options` can only be used together with `shell`. In flows it is only allowed for commands of type `console`. GMT rejects the `usage_scenario.yml` otherwise.

For [flows on the host](#flows-on-the-host) the options depend on the shell:

- `powershell` and `pwsh` have no such switches. GMT prepends `$ErrorActionPreference = 'Stop'` and `Set-StrictMode -Version Latest` as statements to the command instead. There is no equivalent for `pipefail`. If you set `shell-options` for PowerShell, a string is prepended as one statement and a list as one statement per entry.
- `cmd` has no way to express these options. GMT sets none and aborts the run if you configure non-empty `shell-options`.

### compose-file:

If you specify the `compose-file` key the referenced compose file will be included into the usage_scenario.
This is a feature so you can develop your app using the standard compose functionality and you don't need
to duplicate your configuration in the `usage_scenario.yml` file.

Example:

```yml
compose-file: !include compose.yml
```

Please see the !include section for more details on how to use this functionality. Through using this
syntax you tell the parser to include the `compose.yml` file before doing any parsing of the
usage_scenario. This is done so you can modify values that are defined in the compose file. For example you could have a section in your compose

```yml
services: ...
  gcb-wordpress: ...
    volumes:
      - ./wordpress.conf:/etc/apache2/sites-enabled/wordpress.conf:ro
```

than loads a configuration into the container. Which is fine for your production system but when doing the
benchmark you want to load a different configuration file. This can easily be done by just adding

```yml
services: ...
  gcb-wordpress: ...
    volumes:
      - ./wordpress_bench.conf:/etc/apache2/sites-enabled/wordpress.conf:ro
```

into your `usage_scenario.yml`. Of course you can also add key/values.

### !include

It is possible to include files into your `usage_scenario.yml`. This is useful, for example, if you want to use different flows for various measurements but the services stay the same.
Like this you could have a `usage_services.yml` that has the services section and in your `usage_scenario.yml` you can

```txt
services: !include services.yml
```

It is also possible to add a key selector so you can select which content you want

```txt
services: !include utils.yml services
```

### Read-notes-stdout format specification

If you have the `read-notes-stdout` set to true your output must have this format:

- `TIMESTAMP_IN_MICROSECONDS NOTE_AS_STRING`

Example:
`1656199368750556 This is my note`

Every note will then be consumed and can be retrieved through the API.

Please be aware that the timestamps of the note do not have to be identical
with any command or action of the container. If the timestamp however does not fall
into the time window of your measurement run it will not be displayed in the frontend.

### Unsupported Docker Compose features

All features not listed here are not supported by the Green Metrics Tool.

Since we allow the import of [Docker Compose](https://docs.docker.com/compose/compose-file) files this can lead to importing unsupported features.

GMT will error in this case. If you do not want that add the `ignore-unsupported-compose` key after you have tested your *usage_scenario.yml* file.

## Variables

A variable must adhere to the format `__GMT_VAR_[\w]+__`. An example would be `__GMT_VAR_NUMBER__`.

The value of the variable is a string. It will be replaced as is without adding " or ' though.

Example in a `usage_scenario.yml`:

```yml
---
name: Test Stress
author: Dan Mateas
description: test

services:
  test-container:
    image: gcb_stress
    build:
      context: ../stress-application

flow:
  - name: Stress
    container: test-container
    commands:
      - type: console
        command: stress-ng -c 1 -t __GMT_VAR_DURATION__ -q
        note: Starting Stress
```

Here we can leverage the variable functionality to supply different durations without creating new usage scenarios all the time.

Beware that it is often very helpful to put the whole command in quotes like this:

```yml
...
command: "stress-ng -c 1 -t __GMT_VAR_DURATION__ -q"
...
```

The reason being that when your variable contains *YAML* control characters like a *:* you might get into parsing errors.

A run where we want the variable to be *1* as example can be started like this:

```bash
python3 runner.py --uri PATH_TO_SCENARIO --variable "__GMT_VAR_DURATION__=1"
```

See more details in [Runner switches →]({{< relref "/docs/measuring/runner-switches" >}})

The API accepts these variables also in the `usage_scenario_variables` field of the `/v1/runs/add` endpoint. See the [API documentation →]({{< relref "/docs/api/overview" >}}) for details.

### Secret variables

Variables whose name matches `__GMT_VAR_SECRET_[\w]+__`, for example `__GMT_VAR_SECRET_API_TOKEN__`, hold secrets like passwords or tokens. They are replaced into the `usage_scenario.yml` like every other variable, but GMT never stores or displays their plaintext:

- The value is encrypted before it is stored. The database and the dashboard only contain the encrypted form. The runner decrypts it only in memory to replace the variable.
- The plaintext is redacted from everything GMT prints or saves, like the logged commands, the container and process logs, warnings and error messages.
- When you run `runner.py` on a machine without an encryption key, the secret is stored as `*****GMT-REDACTED*****` instead and GMT prints a warning.
- The API refuses secret variables with HTTP status 422 if encryption is not configured on the server.

How to set up the encryption keys is described in [Private repositories →]({{< relref "/docs/cluster/private-repositories.md" >}}).

### Custom Metrics

Custom Metrics are a super set of the SCI metrics which however are configured identically.

Please see [Software Carbon Intensity (SCI) →]({{< relref "carbon/sci" >}}) for more information.
