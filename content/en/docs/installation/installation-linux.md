---
title: "Installation on Linux"
description: "Installation"
lead: ""
date: 2022-06-15T01:49:15+00:00
weight: 302
toc: true
---

If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load some configurations and/or daemons.

To get correct measurements, the tool requires a linux distribution as foundation, a webserver (instructions only given for NGINX, but any webserver will do), python3 including some packages, and docker installed (rootless optional). In this manual we are assuming you are running a Debian/ Ubuntu flavour of Linux.

Currently the following distributions have been tested and are fully supported:
- Ubuntu 24.04
- Ubuntu 22.04
- Fedora 38

The following distributions have been tested, but require manual work:
- Ubuntu 18.04 (works, but Python3 has to be updated to 3.10, *glib2* has to be manually updated to *glib2 2.68* to support [g_string_replace](https://docs.gtk.org/glib/method.String.replace.html) and *libsensors* has to be updated to *libsensors 3.6.0* to support [SENSORS_SUBFEATURE_POWER_MIN](https://github.com/lm-sensors/lm-sensors/commit/dcf23676cc264927ad58ae7960f518689372741a))
- Ubuntu 20.04 (works, but Python3 has to be updated to 3.10, *glib2* has to be manually updated to *glib2 2.68* to support [g_string_replace](https://docs.gtk.org/glib/method.String.replace.html))
- Ubuntu 22.10 (works for development, but [cluster installation]({{< relref "/docs/cluster/installation" >}}) has different names for timers)

{{< callout context="note" icon="outline/info-circle" >}}
If you want to develop on macOS or Windows please use the appropriate installation description: <ul><li><a href='/docs/installation/installation-mac/'>Installation on Mac</a></li><li><a href='/docs/installation/installation-windows/'>Installation on Windows (WSL)</a></li></ul>
{{< /callout >}}

## Downloading and installing required packages

For the sake of this manual we put the green metrics tool into your home directory. Of course you can place it anywhere.
Also we trigger a `apt-upgrade`. If you do not want that upgrade or a different path for the tool please modify the commands accordingly.

{{< tabs "install-packages" >}}
{{< tab "Ubuntu" >}}

```bash
sudo apt update && \
sudo apt upgrade -y && \
sudo apt install -y curl git make gcc python3 python3-pip python3-venv && \
git clone https://github.com/green-coding-solutions/green-metrics-tool ~/green-metrics-tool && \
cd ~/green-metrics-tool

```

{{< /tab >}}
{{< tab "Fedora" >}}

```bash
sudo dnf upgrade -y && \
sudo dnf install -y curl git make gcc python3 python3-devel && \
git clone https://github.com/green-coding-solutions/green-metrics-tool ~/green-metrics-tool && \
cd ~/green-metrics-tool
```

{{< /tab >}}
{{< /tabs >}}

## Docker

Docker provides a great installation help on their website that will probably be more up to date than this readme: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

This is also the reason why the docker client is not part of the install script that we provide.

However, we provide here what we used in on our systems, but be sure to double check on the official website. Especially if you are running a different distribution.

### Docker base install

{{< tabs "docker" >}}
{{< tab "Ubuntu" >}}

```bash
sudo apt install ca-certificates curl gnupg lsb-release -y && \
sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && \
sudo apt remove docker docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc -y && \
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

{{< /tab >}}
{{< tab "Fedora" >}}

```bash
sudo dnf remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
```

{{< /tab >}}
{{< /tabs >}}

You can check if everything is working fine by running `docker stats`. It should connect to the docker daemon and output a view with container-id, name, and stats, which should all be empty for now. You can also run
`sudo docker run hello-world` which will run a little welcome container.

### Root mode (default)

Since `v0.20` the Green Metrics Tool supports docker in it's default root mode.

However you need to add your current user to the `docker` group. We need this so we do not need to start the Green Metrics Tool with `root` privileges.

Please follow this explanation how to do it: [Official docker docs on docker group add](https://docs.docker.com/engine/install/linux-postinstall/)

=> If you want to use the rootless mode anyway you do not have to to that. Just read the next paragraph.


### Rootless mode (optional)

Rootless mode allows the docker container to not inherit `root` rights when they run.

{{< callout context="note" icon="outline/info-circle" >}}
We recommend this mode when you have the Green Metrics Tool on a public machine, running somebody elses benchmarks or somewhere, where security is a concern. For development and try-out purposes of the Green Metrics Tool however you can safely skip this step.
{{< /callout >}}

In order to use rootless mode you must have a non-root user on your system (see [https://docs.docker.com/engine/security/rootless/](https://docs.docker.com/engine/security/rootless/)

👉 Typically a normal installation of Ubuntu/ Fedora has at least one non-root user setup during installation, so there is no need to create a different user from the one you are using already.

**Important: If you have just created a non root user be sure to relog into your system (either through relogging, or a new ssh login) with the non-root user. A switch with just `su my_user` will not work.**

{{< tabs "rootless" >}}
{{< tab "Ubuntu" >}}
The `docker-ce-rootless-extras` package on Ubuntu provides a *dockerd-rootless-setuptool.sh* script, which must be installed and run:

```bash
sudo systemctl disable --now docker.service docker.socket && \
sudo rm /var/run/docker.sock && \
sudo apt install uidmap && \
sudo apt update && \
sudo apt-get install -y docker-ce-rootless-extras dbus-user-session && \
dockerd-rootless-setuptool.sh install
```

After the installation the install script will tell you to add some `export` statements to your `.bashrc` file.
Please do so to always have the correct paths referenced if you open a new terminal.

Lastly please run the following commands to have the docker daemon always lingering:

```bash
systemctl --user enable docker
sudo loginctl enable-linger $(whoami)
```

{{< /tab >}}
{{< tab "Fedora" >}}
The `docker-ce-rootless-extras` package on Fedora provides a *dockerd-rootless-setuptool.sh* script, which must be installed and run:

```bash
sudo systemctl disable --now docker.service docker.socket && \
sudo dnf install -y shadow-utils fuse-overlayfs iptables && \
sudo dnf install -y docker-ce-rootless-extras && \
dockerd-rootless-setuptool.sh install
```

After the installation the install script will tell you to add some `export` statements to your `.bashrc` file.
Please do so to always have the correct paths referenced if you open a new terminal.

Lastly please run the following commands to have the docker daemon always lingering:

```bash
systemctl --user enable docker
sudo loginctl enable-linger $(whoami)
```

{{< /tab >}}
{{< /tabs >}}

You must also enable the cgroup2 support with the metrics granted for the user: [https://rootlesscontaine.rs/getting-started/common/cgroup2/](https://rootlesscontaine.rs/getting-started/common/cgroup2/).

Make sure to also enable the CPU, CPUSET, and I/O delegation as instructed there.

## Setup

Please run the `install_linux.sh` script in the root folder.

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
- Install needed development libraries via `apt` for metric providers to build
- Build the binaries for the Metric Providers
- Set needed `/etc/sudoers` entry for requesting kernel scheduler info

Please note that whenever you run the Green Metrics Tool you have to first activate the python `venv`.

{{< callout context="note" icon="outline/info-circle" >}}
Note for ARM systems: Please use the '-r' flag, which will tell the script to not install the 'msr-tools' package. A tool that is only available on Intel and AMD systems.
{{< /callout >}}

What you might want to add:

- SMTP mail sending is by default deactivated, so for a quick-start you do not have to change that in the `config.yml`
- The RAPL reporter is by default deactivated. Please check the [Metric Providers Documentation](https://docs.green-coding.io/docs/measuring/metric-providers) on how to active it

After that you can start the containers (use `sudo` if running in docker root mode):

- Build and run in the `docker` directory with `[sudo] docker compose up`
- The compose file uses volumes to persist the state of the database even between rebuilds. If you want a fresh start use: `[sudo] docker compose down -v && [sudo] docker compose up`
- To start in detached mode just use `[sudo] docker compose up -d`

### Connecting to DB

You can now connect to the db directly on port 9573, which is exposed to your host system.\
This exposure is not strictly needed for the green metrics tool to run, but is useful if you want to access the db directly. If you do not wish to do so, just remove the `9573:9573` entry in the `compose.yml` file.

The database name is `green-coding`, user is `postgres`, and the password is what you have specified during the `install_linux.sh` run, and can be found in the `compose.yml` file.

### Restarting Docker containers on system reboot

{{< callout context="note" icon="outline/info-circle" >}}
This explanation is for docker rootless mode only.
{{< /callout >}}

We recommend `systemd`. Please use the following service file and change the **USERNAME** accordingly to the ones on your system.

The file will be installed to: `/home/USERNAME/.config/systemd/user/green-coding-service.service`

```systemd
[Unit]
Description=Docker Compose for all our services
After=docker.service

[Service]
Type=simple
ExecStart=/home/USERNAME/startup-docker.sh
Restart=on-failure
RestartSec=5s
StartLimitBurst=10
StartLimitInterval=0

[Install]
WantedBy=default.target
```

As you can see *Restart* is set to *on-failure*. The reason is that the docker dameon will restart the containers by itself. The `systemd` script is only needed to start the container once on reboot.

As you can see we also reference the `/home/USERNAME/startup-docker.sh` file which `systemd` expects to be in your green metrics tool directory.

Please create the following file in your home directory:

```bash
#!/bin/bash
docker context use rootless
docker compose -f PATH_TO_GREEN_METRICS_TOOL/docker/compose.yml up -d
```

Now you can reload and enable the daemon:

```bash
systemctl --user daemon-reload
systemctl --user enable green-coding-service
```

Since the service runs as a user it might be the case that the user is not logged in. So we also enable lingering
which guarantees that processes can be started when no user is logged in:

```bash
loginctl enable-linger $(whoami)
```

### Dockerfiles architecture explanation:

- The postgres container has a volume mount. This means that data in the database will persist between container removals / restarts
- The interconnect between the gunicorn and the nginx container runs through a shared volume mount in the filesystem. Both use the user `www-data` to read and write to a UNIX socket in `/tmp`
- all webserver configuration files are mounted on start of the container as read-only. This allows for changing configuration of the server through git-pull or manual editing without having to rebuild the docker image.
- postgresql can detect changes to the structure.sql. If you issue a `docker compose down -v` the attached volume will be cleared and the postgres container will import the database structure fresh.

## Metric providers

Some metric providers need extra setup before they work.

### LM-Sensors

The required libraries are installed automatically via the `install-linux.sh` call. Some modifications need to be made to your `config.yml`  file though, which are detailed in the lm-sensors metric provider [documentation →]({{< relref "/docs/measuring/metric-providers/lm-sensors" >}}), along with further details regarding prerequisites.

### XGBoost

The XGBoost metrics provider can estimate the power consumption of the total
system (AC-Energy). It is included as a submodule in the Green Metrics Tool and should have been checked out with the initial install command of this manual. The `config.yml` file also needs additional details which are detailed in the metric provider [documentation→]({{< relref "/docs/measuring/metric-providers/psu-energy-xgboost-machine" >}}).

### GPU measurement (NVIDIA NVML)

The *NVIDIA NVML* metrics reporter can read the power draw of an *NVIDIA* GPU.
See [NVIDIA NVML metric provider]({{< relref "/docs/measuring/metric-providers/gpu-energy-nvidia-nvml-component" >}}) detail page on details which additional libraries need to be installed.

On *Ubuntu* and *Fedora* you can just append `--nvidia-gpu` to the install script to try an auto-install.


### DC Metrics Provider

Some of our PSU metrics providers may need specific hardware attached to your machine in order to run. These include the [Powerspy]({{< relref "docs/measuring/metric-providers/psu-energy-ac-powerspy2-machine" >}}), [MCP]({{< relref "docs/measuring/metric-providers/psu-energy-ac-mcp-machine" >}}), and [Picolog]({{< relref "docs/measuring/metric-providers/psu-energy-dc-picolog-machine" >}}) metric providers. Please look for details in each provider's corresponding documentation


### RAPL

On kernels > 2.6 all the kernel modules should automatically be loaded.

However just in case run:

```bash
sudo modprobe intel_rapl_common # or intel_rapl for kernels < 5
sudo modprobe intel_rapl_msr
sudo modprobe rapl
```

## Live system

**ℹ️ If you just want to run the Green Metrics Tool locally this step can be skipped \
ℹ️ It is only if you want to host the Green Metrics Tool on a live server.**

### Updating port to 80

The development setup of the GMT binds on port 9142. For a normal setup on a live
server we recommend binding it to port 80.

The change is done in the `/docker/compose.yml` file.

```yml
green-coding-nginx:
    [...]
    ports:
      - 9142:80 # change this to 80:80
```

### SSL

SSL is an option you can activate in the install process directly.

The install script will ask if you want to activate it or not. In case you select yes
you must supply the path for the certificate file and the key file where they will copied into the correct locations to be accessible by the NGINX container.

At the moment an SSL active installation must be supplied a **https://** url and the webserver will be listening on port 443. You can manually change that in the `frontend.conf` and the `api.conf` files if necessary.

If your certificates change just re-run the install script and supply the new filenames.
