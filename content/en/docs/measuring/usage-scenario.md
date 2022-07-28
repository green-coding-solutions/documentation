---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
lead: ""
date: 2022-06-16T08:48:45+00:00
---

The `usage_scenario.yml` consists of two main blocks:
- `setup` - Handles the orchestration of containers
- `flow` - Handles the interaction with the containers


At the beginning of the file you should specify name, author, version and
architecture.
These will help you later on distinguish which version of the software was certified
if you use the repository url multiple times in the certification process.

Supported architecture for the moment is only **linux**

### Setup
The setup block is the starting point of the usage scenario.

Example:
```yaml
- type: network
  name: wordpress-mariadb-data-green-coding-network
- type: container
  name: green-coding-wordpress-mariadb-data-container
  identifier: wordpress-official-data_mariadb
  env:
    MYSQL_ROOT_PASSWORD: somewordpress
    MYSQL_DATABASE: wordpress
    MYSQL_USER: wordpress
    MYSQL_PASSWORD: wordpress
  portmapping:
  - 3306:3306
  setup-commands:
  - sleep 20
  network: wordpress-mariadb-data-green-coding-network
```

- `setup` **[array]**: (Array of containers / networks for orchestration)
    + `name` **[a-zA-Z0-9_]**:
        * Docker container or docker network name 
    + `type` **[network | container]**:
        * Type of the element
    + `identifier` **[str]**: *(only for type container)*
        * Docker image identifier accessible locally on Docker Hub
    + `portmapping` **[int:int]**: *(optional and only for type container)*
        * Docker container portmapping on host OS to be used with `--unsafe` flag. 
    + `env` **[key-value]**: *(optional and only for type container)*
        * Key-Value pairs for ENV variables inside the container
    + `setup-commands` **[array]**: 
        * Array of commands to be run before actual load testing. Mostly installs will be done here. Note that your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin

### Flow
Flow handles the actual load testing.

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

- `flow` **[array]**: (Array of flows to interact with containers)
    + `name` **[str]**:
        * An arbitrary name, that helps you distinguish later on where the load happend in the chart
    + `container` **[a-zA-Z0-9_]**: 
        * The name of the container specified on `setup` which you want the run the flow
    + `commands` **[array]**:
        * `type` **[console]**: (Only console currently supported)
            - `console` will execute a shell command inside the container
        * `command` **[str]**: 
            - The command to be executed. If type is `console` then piping or moving to background is not supported.
        * `detach` **[bool]**: (optional. default false)
            - When the command is detached it will get sent to the background. This allows to run commands in parallel if needed, for instance if you want to stress the DB in parallel with a web request
        * `note` **[str]**: *(optional)*
            - A string that will appear as note attached to the datapoint of measurement (optional)
        * `read-notes-stdout` **[bool]**: *(optional)*
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
- Commands have a time-limit configured in [Configuration →]({{< relref "configuration" >}}). If your measure locally you can increase that limit if your commands take longer
- In our Green Metrics Tool online version this limit is currently fixed. You may issue multiple separate commands though if you like.
    + We will introduce a fixed limit of 15 Minutes for the whole measurement run for our online version in the near future thoug.
