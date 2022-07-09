---
title: "Dockerfile Installation"
description: "Dockerfile Installation"
lead: ""
date: 2019-06-06T08:49:15+00:00
draft: false
images: []
---

Having done all the steps as instructed on [Installation Overview →]({{< relref "installation-overview" >}}), you can now proceed to the Dockerfile installation of our tool.

## Dockerfiles method

The Dockerfiles will provide you with a running setup of the working system with just a few commands.

It can technically be used in production, however it is designed to run on your local machine for testing purposes.

The system binds in your host OS to port 8000. So it will be accessible through `http://metrics.green-coding.local:8000`


### Setup

Please run the `install.sh` script in the root folder.

This script will:
- Set the database password for the containers
- Create the needed `/etc/hosts` entries for development
- Build the binaries for the Metric Providers
- Add entries in the `/etc/sudoers` file to start some metric reporters without prompting passwords
    + This is needed, since some metrics can only be read as `root` and we do not want to run the whole measurement as root. Only the spawned processes for the Metric Reporters

What you might want to add:
- SMTP mail sending is by default deactived, so for a quick-start you do not have to change that in the `config.yml`
- The RAPL reporter is by default deactived. Please check the [Metric Providers Documentation](https://docs.green-coding.org/docs/measuring/metric-providers) on how to active it

After that you can start the containers:
- Build and run in the `docker` directory with `docker compose up`
- The compose file uses volumes to persist the state of the database even between rebuilds. If you want a fresh start use: `docker compose down -v && docker compose up`
- To start in detached mode just use `docker compose -d`

### Connecting to DB
You can now connect to the db directly on port 5432, which is exposed to your host system.\
The expose to the host system is not needed. If you do not want to access the db directly just remove the `5432:5432` entry in the `compose.yml` file.

The database name is `green-coding`, user is `postgres`, and the password is what you have specified during the `compose.yml` file.

### Restarting Docker containers on system reboot

We recommend `systemd`. Please use the following service file and change the **USERNAME** and **GROUPNAME** accordingly to the ones on your system:

```systemd
[Unit]
Description=Docker Compose for all our services
After=network.target

[Service]
Type=simple
User=USERNAME
Group=GROUPNAME
ExecStart=/home/USERNAME/startup-docker.sh
Restart=never

[Install]
WantedBy=multi-user.target
```

As you can see *Restart* is set to never. The reason is, that the docker dameon will restart the containers by itself. The `systemd` script is only needed
to start the container once on reboot.

As you can see we also reference the `/home/USERNAME/startup-docker.sh` file which `systemd` expects to be in your home directory.

Please create the following file in your home directory and change **PATH_TO_GREEN_METRICS_TOOL** accordingly:
```bash
#!/bin/bash
docker context use rootless
/home/USERNAME/bin/docker compose -f PATH_TO_GREEN_METRICS_TOOL/docker/compose.yml up -d
```

## Architecture explanation:
- The postgres container has a volume mount. This means that data in the database will persists between container removals / restarts
- The interconnect between the gunicorn and the nginx container runs through a shared volume mount in the filesystem. Both use the user `www-data` to read and write to
a UNIX socket in `/tmp`
- all webserver configuration files are mounted on start of the container as read-only. This allows for changing configuration of the server through git-pull / yourself
without having to rebuild the docker image.
- postgresql can detect changes to the structure.sql. If you issue a `docker compose down -v` the attached volume will be cleared and the postgres container
will import the database structure fresh.


## Limitations
These Dockerfiles are not meant to be used in production. The reason for this is that the containers depend on each other and have to be started and stopped alltogether, and never on their own.
