---
title: "Installation on MacOS"
description: "A description on how to install the GMT on Apple machines"
lead: ""
date: 2023-01-30T01:49:15+00:00
weight: 902
---
{{< alert icon="⚠" text="Running the GMT on Macs will never give you correct measurements! It should only ever be used to test your project for correctness in that it will run on the GMT but never to benchmark software " />}}

If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load some configurations and/or daemons.

We have tested the tool on Intel as well as on Apple Silicon chips. Results may vary.


## Downloading and installing required packages

```bash
git clone https://github.com/green-coding-berlin/green-metrics-tool ~/green-metrics-tool
```

## Docker

Docker provides a great installation help on their website: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/). You can just use the docker desktop bundle that should come with everything you will need.

You can check if everything is working fine by running `docker stats`. It should connect to the docker daemon and output a view with container-id, name, and stats, which should all be empty for now.

You can also use the docker desktop client to start/ stop containers if you prefer a GUI application over the terminal.

## Setup

Please run the `install_mac.sh` script in the installed folder (if you followed the instructions `~/green-metrics-tool`).

This script will:

- Ask for the URLs of where to deploy the frontend and API
  + If you are working locally we strongly encourage you to use the defaults of `http://metrics.green-coding.internal:9142` and `http://api.green-coding.internal:9142`. All other local domains are not supported out of the box.
  + If you plan to deploy on an outside visible URL please type the URL including `https://` but omitting port if it
is running on port `80` or `443`
- Set the database password for the containers
  + By default the script will ask you to provide a password, but you can also pass it in directly with the -p parameter.
- Initialize and update git submodules
- Install a python `venv` and activate it
- Create the needed `/etc/hosts` entries for development
- Set needed `/etc/sudoers` entry for running/ killing the `powermetrics` tool

Please not that whenever you run the Green Metrics Tool you have to first activte the python `venv`!

After that you can start the containers:

- Build and run in the `docker` directory with `docker compose up --build`
- The compose file uses volumes to persist the state of the database even between rebuilds. If you want a fresh start use: `docker compose down -v && docker compose up`
- To start in detached mode just use `docker compose up -d`

### Metric Providers

On Linux we use a multitude of metric providers to give us statistics we use to benchmark programs. On MacOS correct
values are not to come by so we use the `powermetrics` tool to get some relevant data. In the future we might
include more providers but for now you only need to use the one.

You will need to disable all providers and enable the:

```yml
powermetrics.provider.PowermetricsProvider:
    resolution: 100
```

in the `config.yml`.

### Connecting to DB

You can now connect to the db directly on port 9573, which is exposed to your host system.\
This exposure is not strictly needed for the green metrics tool to run, but is useful if you want to access the db directly. If you do not wish to do so, just remove the `9573:9573` entry in the `compose.yml` file.

The database name is `green-coding`, user is `postgres`, and the password is what you have specified during the `install.sh` run, and can be found in the `compose.yml` file.

### Dockerfiles architecture explanation:

- The postgres container has a volume mount. This means that data in the database will persist between container removals / restarts
- The interconnect between the gunicorn and the nginx container runs through a shared volume mount in the filesystem. Both use the user `www-data` to read and write to a UNIX socket in `/tmp`
- all webserver configuration files are mounted on start of the container as read-only. This allows for changing configuration of the server through git-pull or manual editing without having to rebuild the docker image.
- postgresql can detect changes to the structure.sql. If you issue a `docker compose down -v` the attached volume will be cleared and the postgres container will import the database structure fresh.

### Notes / Caveats

- The macOS tooling was mainly developed to create `usage_scenario` files conveniently on the Mac. However it provides\
  no validated accuracy or open source code as the `powermetrics` tool used is quite opaque and undocumented.
- As it is not recommended to run the GMT on MacOS as a service we don't document this here. There is no need to configure
  SMTP or email services.
- While we support MacOS features are still experimental and shouldn't be used in production. Please use the more stable
  Linux version here.
- There is a problem in the way the `powermetrics` tool reports time in that the resolution of the timestamp is
  seconds with a delta given in ns. The problem is that we don't know when in this initial second the process has started.
  So when looking at the results the "Start of measurement" and "End of measurement" can be shifted by max 1 second.
