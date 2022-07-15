---
title: "usage_scenario.yml"
description: "Specification of the usage_scenario.yml file"
lead: ""
date: 2022-06-17T08:48:45+00:00
draft: false
images: []
---

# TODO

In the setup part of our [usage_scenario.yml →]({{< relref "usage-scenario" >}}) you can however provide
additional options to run the container, which are very helpful in terms of reusing other peoples containers.
For instance you can run an `apt install` to install one missing tool in a standard `ubuntu` container without
having the need to create a new image on DockerHub.


At the beginning of the file you should specify name, author, version and
architecture.
These will help you later on distinguish which version of the software was certified
if you use the repository url multiple times in the certification process.

Supported architecture for the moment is only "linux"


### Setup
The setup block is the starting point of the usage scenario.

- "name": A valid docker Container name [a-zA-Z0-9_]
- "type": Currently only "container" is supported
- "identifier": A valid identifier accessible on docker hub
- "portmapping": Expose a port to other containers for later use (optional)
- "setup-commands": Commands to be run before actual load testing. Mostly installs will be done here. Note that
your docker container must support these commands and you cannot rely on a standard linux installation to provide access to /bin (optional)

### Flow
Flow handles the actual load testing

- "name": An arbitrary name, that helps you distinguish later on where the load happend in the chart
- "container": The same name you specified on "Setup" where you want to run the following commands
- "commands": An array of objects
- "commands" -> "type": Only console currently supported
- "commands" -> "command": The command to be executed. Piping or moving to background is not supported. Note: This command will block execution. If you need parallel execution supply "detach"
    => Commands have a time-limit. The command may take currently at max 60 seconds and then the execution will be terminated and the measurement aborted.
    => If your commands take longer you can increase this limit in the config.yml on your local installation
    => In our Green Metrics Tool online version this limit is currently fixed. You may issue multiple commands though if you like
    => Be aware that the whole measurement run at the moment may take no longer than 15 minutes.
- "commands" -> "detach": Detach process True / False (optional)
    => This functionality is meant to run processes in conjuction to other processes in the same flow. For instance when you want to stress the DB in parallel with a web request
    => Please note that a detached process cannot be be closed through our flow mechanism. It will only be destroyed upon the end of the flow when the container is spun down or when it ends on its own.
- "commands" -> "note": A string that will appear as note attached to the datapoint of measurement (optional)
- "commands" -> "read-notes-stdout": Read notes from the STDOUT of the command. This is helpful if you have a long running command that does multiple steps and you want to log every step.
