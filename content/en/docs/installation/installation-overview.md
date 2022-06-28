---
title: "Installation Overview"
description: "Installation Overview"
lead: ""
date: 2022-06-15T01:49:15+00:00
draft: false
images: []
---


There are two installation methods:



[Manual installation →]({{< relref "manual-installation" >}})
[Dockerfile installation →]({{< relref "dockerfile-installation" >}})

In either case, you'll need to have a few things installed on your machine first. Here's a guide on how to get you started.

## Setting up your machine

Installing the toolchain takes about 30 Minutes to 1 hour, depending on linux knowledge.

Important: If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load / reload some configuration and / or daemons.

The tool requires a linux distribution as foundation, a webserver (instructions only given for NGINX, but any webserver will do) python3 including some packages and docker installed (rootless optional).

We will directly install to /w as the tool should be run on a dedicated node anyway. This is because of the competing resource allocation when run in a shared mode and also because of security concerns.

We recommend to fully reset the node after every run, so no data from the previous run remains in memory or on disk.

```bash
git clone https://github.com/green-coding-berlin/green-metrics-tool /var/www/green-metrics-tool

sudo apt update

sudo apt dist-upgrade -y

sudo apt install postgresql python3 python3-pip gunicorn nginx libpq-dev python-dev postgresql-contrib -y

sudo pip3 install psycopg2 fastapi "uvicorn[standard]" pandas pyyaml
```

The sudo in the last command is very important, as it will tell pip to install to /usr directory instead to the home directory. So we can find the package later with other users on the system. If you do not want that use a venv in Python.

## Docker

Docker provides a great installation help on their website that will probably be more up2date than this readme: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

However, we provide here what we typed in on our Ubuntu system, but be sure to double check on the official website. Especially if you are not running Ubuntu.

### Base install
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt remove docker docker-engine docker.io containerd runc

sudo apt-get install ca-certificates curl gnupg lsb-release

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

You can check if all is working fine by running ```docker stats```. It should connect to the docker daemon and output a "top" like view, which is empty for now.

### Rootless mode (strongly recommended)
If you want rootless mode however be sure to follow the instructions here: [https://docs.docker.com/engine/security/rootless/](https://docs.docker.com/engine/security/rootless/) After running the dockerd-rootless-setuptool.sh script, you may need to add some lines to your .bashrc file. Also you need to have a non-root user in place before you go through this process :)

The process may pose some challenges, as depending on your system some steps might fail. We created a small summary of our commands, but these are subject to change.

### Important:
Before doing these steps be sure to relog into your system (either through relogging, or doing a new ssh login) with the non-root user.

A switch with "su my_user" will break and make install impossible.

```bash
sudo systemctl disable --now docker.service docker.socket

sudo apt install uidmap

sudo apt update

sudo apt-get install -y docker-ce-rootless-extras dbus-user-session

dockerd-rootless-setuptool.sh install
```

Be sure now to add the export commands that are outputted to your .bashrc or similar.

```bash
systemctl --user enable docker

sudo loginctl enable-linger $(whoami)
```

And you must also enable the cgroup2 support with the metrics granted for the user: [https://rootlesscontaine.rs/getting-started/common/cgroup2/](https://rootlesscontaine.rs/getting-started/common/cgroup2/) Make sure to also enable the CPU, CPUTSET, and I/O delegation.

## Next steps

Now you can proceed to either the [Manual installation →]({{< relref "manual-installation" >}}) or the [Dockerfile installation →]({{< relref "dockerfile-installation" >}}).