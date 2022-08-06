---
title: "Installation Overview"
description: "Installation Overview"
lead: ""
date: 2022-06-15T01:49:15+00:00
weight: 901
---
## Setting up your machine

If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load some configurations and/or daemons.

The tool requires a linux distribution as foundation, a webserver (instructions only given for NGINX, but any webserver will do), python3 including some packages, and docker installed (rootless optional).

We recommend to fully reset the node after every run, so no data from the previous run remains in memory or on disk.

```bash
git clone https://github.com/green-coding-berlin/green-metrics-tool /var/www/green-metrics-tool && \
sudo apt update && \
sudo apt upgrade -y && \
sudo apt install python3 python3-pip libpq-dev -y && \
sudo pip3 install psycopg2 pandas pyyaml
```

The sudo in the last command is very important, as it will tell pip to install to /usr directory instead to the home directory. So we can find the package later with other users on the system. If you do not want that use a venv in Python.

## Docker

Docker provides a great installation help on their website that will probably be more up to date than this readme: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

However, we provide here what we used in on our Ubuntu system, but be sure to double check on the official website. Especially if you are not running Ubuntu.

### Base install
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && \
sudo apt remove docker docker-engine docker.io containerd runc && \
sudo apt-get install ca-certificates curl gnupg lsb-release && \
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

You can check if everything is working fine by running `docker stats`. It should connect to the docker daemon and output a view with container-id, name, and stats, which should all be empty for now.

### Rootless mode (strongly recommended)
If you want rootless mode however be sure to follow the instructions here (make sure you have a non-root user in place first): [https://docs.docker.com/engine/security/rootless/](https://docs.docker.com/engine/security/rootless/) 

After running the dockerd-rootless-setuptool.sh script, you may need to add some lines to your .bashrc file.

The process may pose some challenges, as depending on your system some steps might fail. We created a small summary of our commands, but these are subject to change.

#### Important:
Before doing these steps be sure to relog into your system (either through relogging, or a new ssh login) with the non-root user.

A switch with just "su my_user" will break and make install impossible.

```bash
sudo systemctl disable --now docker.service docker.socket && \
sudo apt install uidmap && \
sudo apt update && \
sudo apt-get install -y docker-ce-rootless-extras dbus-user-session && \
dockerd-rootless-setuptool.sh install
```

Be sure now to add the export commands that are outputted to your .bashrc or similar.

```bash
systemctl --user enable docker
sudo loginctl enable-linger $(whoami)
```

You must also enable the cgroup2 support with the metrics granted for the user: [https://rootlesscontaine.rs/getting-started/common/cgroup2/](https://rootlesscontaine.rs/getting-started/common/cgroup2/) Make sure to also enable the CPU, CPUTSET, and I/O delegation.

## Dockerfiles

The Dockerfiles will provide you with a running setup of the working system with just a few commands.

It can technically be used in production, however it is designed to run on your local machine for testing purposes.

The system binds in your host OS to port 8000. So the web view will be accessible through `http://metrics.green-coding.local:8000`


### Setup

Please run the `install.sh` script in the root folder.

This script will:
- Set the database password for the containers
    - By default the script will ask you to provide a password, but you can also pass it in directly with the -p parameter.
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
This exposure is not strictly needed for the green metrics tool to run, but is useful if you want to access the db directly. If you do not wish to do so, just remove the `5432:5432` entry in the `compose.yml` file.

The database name is `green-coding`, user is `postgres`, and the password is what you have specified during the `install.sh` run, and can be found in the `compose.yml` file.

### Restarting Docker containers on system reboot

We recommend `systemd`. Please use the following service file and change the **USERNAME** and **GROUPNAME** accordingly to the ones on your system.

The file will be installed to: `/etc/systemd/system/green-coding-service.service`

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

As you can see *Restart* is set to never. The reason is that the docker dameon will restart the containers by itself. The `systemd` script is only needed to start the container once on reboot.

As you can see we also reference the `/home/USERNAME/startup-docker.sh` file which `systemd` expects to be in your home directory.

Please create the following file in your home directory and change **PATH_TO_GREEN_METRICS_TOOL** accordingly:
```bash
#!/bin/bash
docker context use rootless
docker compose -f PATH_TO_GREEN_METRICS_TOOL/docker/compose.yml up -d
```

### Dockerfiles architecture explanation:
- The postgres container has a volume mount. This means that data in the database will persists between container removals / restarts
- The interconnect between the gunicorn and the nginx container runs through a shared volume mount in the filesystem. Both use the user `www-data` to read and write to a UNIX socket in `/tmp`
- all webserver configuration files are mounted on start of the container as read-only. This allows for changing configuration of the server through git-pull or manual editing without having to rebuild the docker image.
- postgresql can detect changes to the structure.sql. If you issue a `docker compose down -v` the attached volume will be cleared and the postgres container will import the database structure fresh.


## Cronjob

The Green Metrics Tool comes with an implemented queuing and locking mechanism.

You can install a cronjob on your system to periodically call:
-  `python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project` to measure projects in database queue
-  `python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py email` to send all emails in the database queue

The `jobs.py` uses the python3 faulthandler mechanism and will also report to *STDERR* in case 
of a segfault.
When running the cronjob we advice you to append all the output combined to a log file like so:
`* * * * * python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project &>> /var/log/green-metrics-jobs.log`

Be sure to give the `green-metrics-jobs.log` file write access rights.

Also be aware that our example for the cronjob assumes your crontab is using `bash`.
Consider adding `SHELL=/bin/bash` to your crontab if that is not the case.