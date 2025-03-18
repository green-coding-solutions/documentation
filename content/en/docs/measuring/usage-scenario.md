---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
lead: ""
date: 2022-06-16T08:48:45+00:00
weight: 815
---

The `usage_scenario.yml` consists of these main blocks:

- `networks` - Handles the orchestration of networks
- `services` - Handles the orchestration of containers
- `flow` - Handles the interaction with the containers
- `compose-file*` - A compose file to include.

`*`: means these values are optional.

Its format is an extended subset of the [Docker Compose Specification](https://docs.docker.com/compose/compose-file/), which means that we keep the same format, but disallow some options and also add some exclusive options to our tool. However, keys that have the same name are also identical in function - thought potentially with some limitations.

At the beginning of the file you should specify `name`, `author`, and `architecture`.
These will help you later on tell what the scenario is doing.

**Linux** and **Darwin** are the only supported architectures. If you don't mention an `architecture` it will run on both.

Please note that when running the measurement you can supply an additional name,
which can and should be different from the name in the `usage_scenario.yml`.

The idea is to have a general name for the `usage_scenario.yml` and another one for the specific measurement run.

Example for the start of a `usage_scenario.yml`

```yaml
---
name: My Hugo Test
author: Arne Tarara <arne@green-coding.io>
description: This is just an example usage_scenario ...
```

When running the `runner.py` we would then set `--name` for instance to: *Hugo Test run on my Macbook*

### Networks

Example:

```yaml
networks:
  name: wordpress-mariadb-data-green-coding-network
```

- `networks:` **[dict]** (Dictionary of network dictionaries for orchestration)
  + `name: [NETWORK]` **[a-zA-Z0-9_]** The name of the network with a trailing colon. No value required.

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
      - sleep 20
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
    - `depends_on:` **[list|dict]** *(optional)*
      + Can either be an list of services names on which the service is dependent. It affects the startup order and forces the dependency to be started (container state = "running") before the service is started.
      + Or it can be an dict where you can specify a condition. The `condition` can have two values:
        * `service_healthy`: Will wait for the container until the docker *healthcheck* returns *healthy*.
        * `service_started`: Similar to the list syntax -> this will enforce a starting order and just wait until the container state is "running".
    - `setup-commands:` **[list]** *(optional)*
      + List of commands to be run before actual load testing. Mostly installs will be done here. Note that your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin
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
    - `shell:` **[str]** *(optional)*
      + Will execute the `setup-commands` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
      + Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
    - `log-stdout:` **[boolean]** *(optional)*
      + Will log the *stdout* and make it available through the frontend in the *Logs* tab.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when and how to log.
    - `log-stderr:` **[boolean]** *(optional)*
      + Will log the *stderr* and make it available through the frontend in the *Logs* tab and in error messages.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when and how to log.
    - `read-notes-stdout:` **[bool]** *(optional)*
      + Read notes from *stdout*. Most likely you do not need this, as it also requires customization of your application (writing of a log message in a specific format). It may be helpful if your application has asynchronous operations and you want to know when they have finished.
      + Make sure to also set `log-stdout` to `true`. Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).
    - `read-sci-stdout:` **[bool]** *(optional)*
      + Enables the reading of ticks for the unit of work (*R*) required to calculate the SCI metric.
      + Please see [SCI (Green Software Foundation) →]({{< relref "sci" >}}) for more information.


Please note that every key below `services` will serve as the name of the
container later on. You can overwrite the container name with the key `container_name`.

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
  + `container:` **[a-zA-Z0-9][a-zA-Z0-9_.-]+** The name of the container specified on `setup` which you want the run the flow
  + `commands:` **[list]**
    - `type:` **[console]** (Only console currently supported)
      + `console` will execute a shell command inside the container
    - `command:` **[str]**
      + The command to be executed. If type is `console` then piping or moving to background is not supported.
    - `detach:` **[bool]** (optional. default false)
      + When the command is detached it will get sent to the background. This allows to run commands in parallel if needed, for instance if you want to stress the DB in parallel with a web request
    - `note:` **[str]** *(optional)*
      + A string that will appear as note attached to the datapoint of measurement (optional)
    - `ignore-errors:` **[bool]** *(optional)*
      + If set to `true` the run will not fail if the process in `command` has a different exit code than `0`. Useful
           if you execute a command that you know will always fail like `timeout 0.1 stress -c 1`
    - `shell:` **[str]** *(optional)*
      + Will execute the `command` in a shell. Use this if you need shell-mechanics like redirection `>` or chaining `&&`.
      + Please use a string for a shell command here like `sh`, `bash`, `ash` etc. The shell must be available in your container
    - `log-stdout:` **[boolean]** *(optional)*
      + Will log the *stdout* and make it available through the frontend in the *Logs* tab.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when and how to log.
    - `log-stderr:` **[boolean]** *(optional)*
      + Will log the *stderr* and make it available through the frontend in the *Logs* tab and in error messages.
      + Please see the [Best Practices →]({{< relref "best-practices" >}}) for when and how to log.
    - `read-notes-stdout:` **[bool]** *(optional)*
      + Read notes from the *stdout* of the command. This is helpful if you have a long running command that does multiple steps and you want to log every step.
      + Make sure to also set `log-stdout` to `true`. Format specification is documented below in section [Read-notes-stdout format specification →]({{< relref "#read-notes-stdout-format-specification" >}}).
    - `read-sci-stdout:` **[bool]** *(optional)*
      + Enables the reading of ticks for the unit of work (*R*) required to calculate the SCI metric.
      + Please see [SCI (Green Software Foundation) →]({{< relref "sci" >}}) for more information.

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
