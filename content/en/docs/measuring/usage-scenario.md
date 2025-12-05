---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
date: 2022-06-16T08:48:45+00:00
weight: 415
---

The `usage_scenario.yml` consists of these main blocks:

- Start of the file with some basic root level keys
- `services` - Handles the orchestration of containers
- `networks` - (optional) Handles the orchestration of networks
- `flow` - Handles the interaction with the containers
- `compose-file` - (optional) A compose file to include

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
    - `image:` **[str]** Docker image identifier. If `build` is not provided the image needs to be accessible locally on Docker Hub. If `build` is provided it is used as identifier for the image.
    - `build:` **[str]** *(optional)* Path to build context. See `context` for restrictions. Default for `dockerfile` is `Dockerfile`. Alternatively, you can provide more detailed build information with:
      - `context:` **[str]** *(optional)* Path to the build context. Needs to be in the path or repo that is passed with `--uri` to `runner.py`. Default: `.`.
      - `dockerfile:` **[str]** *(optional)* Path to Dockerfile. Needs to be in `context`. Default: `Dockerfile`.
    - `container_name:` **[a-zA-Z0-9_]** *(optional)* With this key you can overwrite the name of the container. If not given, the defined service name above is used as the name of the container.
    - `environment:` **[dict|list]** *(optional)*
      + Either Key-Value pairs for ENV variables inside the container
      + Or list items with strings in the format: *MYSQL_PASSWORD=123*
    - `ports:` **[int:int]** *(optional)*
      + Docker container portmapping on host OS to be used with `--allow-unsafe` flag.
    - `init:` **[boolean]**
      + Will start a PID 1 *init* process in the container that helps when you are experiencing zombie processes and memory leaks. See [Docker Docs](https://docs.docker.com/reference/cli/docker/container/run/#init) for details
    - `depends_on:` **[list|dict]** *(optional)*
      + Can either be an list of services names on which the service is dependent. It affects the startup order and forces the dependency to be started (container state = "running") before the service is started.
      + Or it can be an dict where you can specify a condition. The `condition` can have two values:
        * `service_healthy`: Will wait for the container until the docker *healthcheck* returns *healthy*.
        * `service_started`: Similar to the list syntax -> this will enforce a starting order and just wait until the container state is "running".
    - `setup-commands:` **[list]** *(optional)*
      + List of commands to be run before actual load testing. Mostly installs will be done here. Note that your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin
      + `command:` **[str]**
        * The command to be executed
      + `shell:` **[str]** *(optional)*
        * Will execute the `setup-commands` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
        ** Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
    - `volumes:` **[list]**  *(optional)*
      + List of volumes to be mapped. Only read if `runner.py` is executed with `--allow-unsafe` flag
    - `networks:` **[list]**  *(optional)*
      + The networks to put the container into. If no networks are defined throughout the `usage_scenario.yml` the container will be put into the default network will all others in the file.
    - `healthcheck:` **[dict]** *(optional)*
      + Please see the definition of these arguments and how healthcheck works in the official docker compose definition. We just copy them over: [Docker compose healthcheck specification](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)
      + `test:` **[str|list]**
      + `interval:` **[str]**
      + `timeout:` **[str]**
      + `retries:` **[integer]**
      + `start_period:` **[str]**
      + `disable:` **[boolean]**
    - `folder-destination`: **[str]** *(optional)*
      + Specify where the project that is being measured will be mounted inside of the container
      + Defaults to `/tmp/repo`
    - `command:` **[str]** *(optional)*
      + Command to be executed when container is started. When container does not have a daemon running typically a shell is started here to have the container running like `bash` or `sh`.
    - `entrypoint:` **[str]** *(optional)*
      + Declares the default entrypoint for the service container. This overrides the ENTRYPOINT instruction from the service's Dockerfile.
      + The value of `entrypoint` can either be an empty string (ENTRYPOINT instruction will be ignored) or a single word (helpful to provide a script).
      + If you need an entrypoint that consists of multiple commands/arguments, either provide a script (e.g. `entrypoint.sh`) or set it to an empty string and provide your commands via `command`.
    - `log-stdout:` **[boolean]** *(optional, default: `true`)*
      + Will log the *stdout* of the container and make it available through the frontend in the *Logs* tab.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `log-stderr:` **[boolean]** *(optional, default: `true`)*
      + Will log the *stderr* of the container and make it available through the frontend in the *Logs* tab and in error messages.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `stream-stdout:` **[boolean]** *(optional, default: `false`)*
      + Will stream the *stdout* directly to the attached output stream. The typical use-case for this is if you are developing locally and start the GMT in a tty.
      + If output is streamed it will not be logged.
    - `stream-stderr:` **[boolean]** *(optional, default: `false`)*
      + Will stream the *stderr* directly to the attached output stream. The typical use-case for this is if you are developing locally and start the GMT in a tty.
      + If output is streamed it will not be logged.
    - `read-notes-stdout:` **[bool]** *(optional)*
      + Read notes from *stdout* of the container.
      + Most likely you do not need this, as it also requires customization of your application (writing of a log message in a specific format). It may be helpful if your application has asynchronous operations and you want to know when they have finished. In most cases, it is more appropriate to read the notes from the command's *stdout* in your flow (see below).
      + Note that `log-stdout` has to be enabled (it is the default).
      + Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).
    - `read-sci-stdout:` **[bool]** *(optional)*
      + Enables the reading of ticks for the unit of work (*R*) required to calculate the SCI metric.
      + Please see [Software Carbon Intensity (SCI) →]({{< relref "carbon/sci" >}}) for more information.
    - `docker-run-args:` **[list]** *(optional)*
      + A list of string that should be added to the `docker run` command of that container.
      + The argument needs to be listed in the `user.capabilities` json under `measurement:orchestrators:docker:allow-args`. The string in the `user.capabilities` can be a regex. Opening this up could be a potential security issue!

Please note that every key below `services` will serve as the name of the
container later on. You can overwrite the container name with the key `container_name`.

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
  + `container:` **\[a-zA-Z0-9\]\[a-zA-Z0-9_.-\]+** The name of the container specified on `setup` which you want the run the flow
  + `commands:` **[list]**
    - `type:` **[console|playwright]**
      + `console` will execute a shell command inside the container
      + `playwright` will execute the playwright command in the container. See the [documentation](/docs/measuring/playwright/) for more details.
    - `command:` **[str]**
      + The command to be executed. If type is `console` then piping or moving to background is not supported.
    - `detach:` **[bool]** (optional, default: `false`)
      + When the command is detached it will get sent to the background. This allows to run commands in parallel if needed, for instance if you want to stress the DB in parallel with a web request
    - `note:` **[str]** *(optional)*
      + A string that will appear as note attached to the datapoint of measurement (optional)
    - `ignore-errors:` **[bool]** *(optional)*
      + If set to `true` the run will not fail if the process in `command` has a different exit code than `0`. Useful
           if you execute a command that you know will always fail like `timeout 0.1 stress -c 1`
    - `shell:` **[str]** *(optional)*
      + Will execute the `command` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
      + Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
    - `log-stdout:` **[boolean]** *(optional, default: `true`)*
      + Will log the *stdout* of the command and make it available through the frontend in the *Logs* tab.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `log-stderr:` **[boolean]** *(optional, default: `true`)*
      + Will log the *stderr* of the command and make it available through the frontend in the *Logs* tab and in error messages.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when to disable the logging.
    - `read-notes-stdout:` **[bool]** *(optional)*
      + Read notes from the *stdout* of the command.
      + This is helpful if you have a long running command that does multiple steps and you want to log every step.
      + Note that `log-stdout` has to be enabled (it is the default).
      + Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).
    - `read-sci-stdout:` **[bool]** *(optional)*
      + Enables the reading of ticks for the unit of work (*R*) required to calculate the SCI metric.
      + Please see [Software Carbon Intensity (SCI) →]({{< relref "carbon/sci" >}}) for more information.

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
    type: container
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

The API accepts these variables as arguments also to the `/v1/software/add` endpoint. See the [API documentation →]({{< relref "/docs/api/overview" >}}) for details.
