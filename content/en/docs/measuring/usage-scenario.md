---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
lead: ""
date: 2022-06-16T08:48:45+00:00
weight: 804
---

The `usage_scenario.yml` consists of three main blocks:
- `networks` - Handles the orchestration of networks
- `services` - Handles the orchestration of containers
- `flow` - Handles the interaction with the containers

Its format is an extended subset of the [Docker Compose Specification](https://docs.docker.com/compose/compose-file/), which means that we keep the same format, but disallow some options and also add some exclusive options to our tool. However keys that have the same name are also identical in function - thought potentially with some limitations.

At the beginning of the file you should specify `name`, `author`, `version` and
`architecture`.
These will help you later on distinguish which version of the software was certified
if you use the repository url multiple times in the certification process.

**Linux** is currently the only supported architecture.

Please note that when running the measurement you can supply an additional name,
which can and should be different from the name in the `usage_scenario.yml`.

The idea is to have a general name for the `usage_scenario.yml` and another one for the specific 
measurement run.

Example for the start of a `usage_scenario.yml`
```bash
---
name: My Hugo Test
author: Arne Tarara
version: 1
architecture: linux
```

When running the `runner.py` we would then set `--name` for instance to: *Hugo Test run on my Macbook*

### Networks
Example:
```yaml
networks:
  name: wordpress-mariadb-data-green-coding-network
```

- `networks:` **[object]** (Object of network objects for orchestration)
    + `name: [NETWORK]` **[a-zA-Z0-9_]** The name of the network with a trailing colon. No value required.

### Services

Example:
```yaml
services:
  gcb-wordpress-mariadb:
    image: gcb_wordpress-mariadb
    container_name: gcb-wordpress-mariadb
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
```


- `services` **[object]**: (Object of container objects for orchestration)
    + `[CONTAINER]:` **[a-zA-Z0-9_]** The name of the container
        - `image:` **[str]** Docker image identifier accessible locally on Docker Hub
        * `environment:` **[object]** *(optional)* 
            - Key-Value pairs for ENV variables inside the container
        * `ports:` **[int:int]** *(optional)*
            - Docker container portmapping on host OS to be used with `--allow-unsafe` flag. 
        * `setup-commands:` **[array]** *(optional)*
            - Array of commands to be run before actual load testing. Mostly installs will be done here. Note that your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin
        * `volumes:` **[array]**  *(optional)*
            - Array of volumes to be mapped. Only read of `runner.py` is executed with `--allow-unsafe` flag
        * `cmd:` **[str]** *(optional)*
            - Command to be executed when container is started. When container does not have a daemon running typically a shell is started here to have the container running like `bash` or `sh`    

Please note that every key below `services` will also serve as the name of the 
container later on.

The Green Metrics Tool does not create auto-generated container names and does
not support the `container_name` key.

### Flow

Example:
```yaml
flow:
  - name: Check Website
    container: green-coding-puppeteer-container
    commands:
    - type: console
      command: node /var/www/puppeteer-flow.js
      note: Starting Pupeteer Flow
      read-notes-stdout: true
    - type: console
      command: sleep 30
      note: Idling
    - type: console
      command: node /var/www/puppeteer-flow.js
      note: Starting Pupeteer Flow again
      read-notes-stdout: true
  - name: Shutdown DB
    container: database-container
    commands:
      - type: console
      command: killall postgres
```

- `flow:` **[array]** (Array of flows to interact with containers)
    + `name:` **[str]** An arbitrary name, that helps you distinguish later on where the load happend in the chart
    + `container:` **[a-zA-Z0-9_]** The name of the container specified on `setup` which you want the run the flow
    + `commands:` **[array]**
        * `type:` **[console]** (Only console currently supported)
            - `console` will execute a shell command inside the container
        * `command:` **[str]** 
            - The command to be executed. If type is `console` then piping or moving to background is not supported.
        * `detach:` **[bool]** (optional. default false)
            - When the command is detached it will get sent to the background. This allows to run commands in parallel if needed, for instance if you want to stress the DB in parallel with a web request
        * `note:` **[str]** *(optional)*
            - A string that will appear as note attached to the datapoint of measurement (optional)
        * `read-notes-stdout:` **[bool]** *(optional)*
            - Read notes from the STDOUT of the command. This is helpful if you have a long running command that does multiple steps and you want to log every step.

### read-notes-stdout format specification

If you have the `read-notes-stdout` set to true your output must have this format:

- `TIMESTAMP_IN_MICROSECONDS NOTE_AS_STRING`

Example: 
`1656199368750556 This is my note`

Every note will then be consumed and can be retrieved through the API.

Please be aware that the timestamps of the note do not have have to be identical 
with any command or action of the container. If the timestamp however does not fall
into the time window of your measurement run it will not be displayed in the frontend.

#### Flow notes
- Commands have a time-limit configured in [Configuration →]({{< relref "configuration" >}}). If you measure locally you can increase that limit if needed.
- In our Green Metrics Tool online version this limit is currently fixed. You may issue multiple separate commands though if you like.
    + We will introduce a fixed limit of 15 Minutes for the whole measurement run for our online version in the near future.
