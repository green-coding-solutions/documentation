---
title: "Installation on Linux"
description: "Installation"
lead: ""
date: 2022-06-15T01:49:15+00:00
weight: 901
---
## Setting up your machine

If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load some configurations and/or daemons.

To get correct measurements, the tool requires a linux distribution as foundation, a webserver (instructions only given for NGINX, but any webserver will do), python3 including some packages, and docker installed (rootless optional). In this manual we are assuming you are running a Debian/ Ubuntu flavour of Linux.

{{< alert icon="💡" text="If you want to develop on macOS please use this installation description: <a href='/docs/installation/installation-mac/'>Installation on Mac</a>" />}}

We recommend to fully reset the node after every run, so no data from the previous run remains in memory or on disk.

For the sake of this manual we put the green metrics tool into your home directory. Of course you can place it anywhere.
Please modify the commands accordingly.

{{< tabs >}}
{{% tab name="Ubuntu" %}}

```bash
git clone https://github.com/green-coding-berlin/green-metrics-tool ~/green-metrics-tool && \
cd ~/green-metrics-tool && \
sudo apt update && \
sudo apt upgrade -y && \
sudo apt install make gcc python3 python3-pip libpq-dev libglib2.0-dev -y && \
sudo python3 -m pip install -r ~/green-metrics-tool/requirements.txt
```

{{% /tab %}}
{{% tab name="Fedora" %}}

```bash
git clone https://github.com/green-coding-berlin/green-metrics-tool ~/green-metrics-tool && \
cd ~/green-metrics-tool && \
sudo dnf upgrade -y && \
sudo dnf install -y make gcc python3 python3-devel libpq-devel glib2-devel
sudo python3 -m pip install -r ~/green-metrics-tool/requirements.txt
```

{{% /tab %}}
{{< /tabs >}}

The sudo in the last command is very important, as it will tell pip to install to /usr directory instead to the home directory. So we can find the package later with other users on the system. If you do not want that use a venv in Python.

## Docker

Docker provides a great installation help on their website that will probably be more up to date than this readme: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

However, we provide here what we used in on our systems, but be sure to double check on the official website. Especially if you are running a different distribution.

### Base install

{{< tabs groupId="docker">}}
{{% tab name="Ubuntu" %}}

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && \
sudo apt remove docker docker-engine docker.io containerd runc -y && \
sudo apt install ca-certificates curl gnupg lsb-release -y && \
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
```

{{% /tab %}}
{{% tab name="Fedora" %}}

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
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
```

{{% /tab %}}
{{< /tabs >}}

You can check if everything is working fine by running `docker stats`. It should connect to the docker daemon and output a view with container-id, name, and stats, which should all be empty for now. You can also run
`sudo docker run hello-world` which will run a little welcome container.

### Rootless mode

The Green Metrics Tool (GMT) is currently designed to work only with Docker in rootless mode.

If your docker daemon currently does not run in rootless mode please follow the heregiven instructions.

In order to use rootless mode you must have a non-root user on your system (see [https://docs.docker.com/engine/security/rootless/](https://docs.docker.com/engine/security/rootless/)

👉 Typically a normal installation of Ubuntu/ Fedora has at least one non-root user setup during installation.

**Important: If you have just created a non root user be sure to relog into your system (either through relogging, or a new ssh login) with the non-root user. A switch with just `su my_user` will not work.**

{{< tabs groupId="rootless">}}
{{% tab name="Ubuntu" %}}
The `docker-ce-rootless-extras` package on Ubuntu provides a *dockerd-rootless-setuptool.sh* script, which must be installed and run:

```bash
sudo systemctl disable --now docker.service docker.socket && \
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

{{% /tab %}}
{{% tab name="Fedora" %}}
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

{{% /tab %}}
{{< /tabs >}}

You must also enable the cgroup2 support with the metrics granted for the user: [https://rootlesscontaine.rs/getting-started/common/cgroup2/](https://rootlesscontaine.rs/getting-started/common/cgroup2/).

Make sure to also enable the CPU, CPUSET, and I/O delegation as instructed there.

### Dockerfiles

The Dockerfiles will provide you with a running setup of the working system with just a few commands.

It can technically be used in production, however it is designed to run on your local machine for testing purposes.

The system binds in your host OS to port 9142. So the web view will be accessible through `http://metrics.green-coding.internal:9142`

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
- Create the needed `/etc/hosts` entries for development
- Install needed development libraries via `apt` for metric providers to build
- Build the binaries for the Metric Providers
- Set needed `/etc/sudoers` entry for requesting kernel scheduler info

What you might want to add:

- SMTP mail sending is by default deactivated, so for a quick-start you do not have to change that in the `config.yml`
- The RAPL reporter is by default deactivated. Please check the [Metric Providers Documentation](https://docs.green-coding.berlin/docs/measuring/metric-providers) on how to active it

After that you can start the containers:

- Build and run in the `docker` directory with `docker compose up`
- The compose file uses volumes to persist the state of the database even between rebuilds. If you want a fresh start use: `docker compose down -v && docker compose up`
- To start in detached mode just use `docker compose -d`

### Connecting to DB

You can now connect to the db directly on port 9573, which is exposed to your host system.\
This exposure is not strictly needed for the green metrics tool to run, but is useful if you want to access the db directly. If you do not wish to do so, just remove the `9573:9573` entry in the `compose.yml` file.

The database name is `green-coding`, user is `postgres`, and the password is what you have specified during the `install_linux.sh` run, and can be found in the `compose.yml` file.

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
ExecStart=/home/USERNAME/green-metrics-tool/startup-docker.sh
Restart=never

[Install]
WantedBy=multi-user.target
```

As you can see *Restart* is set to never. The reason is that the docker dameon will restart the containers by itself. The `systemd` script is only needed to start the container once on reboot.

As you can see we also reference the `/home/USERNAME/green-metrics-tool/startup-docker.sh` file which `systemd` expects to be in your green metrics tool directory.

Please create the following file in your home directory and change **PATH_TO_GREEN_METRICS_TOOL** accordingly:

```bash
#!/bin/bash
docker context use rootless
docker compose -f PATH_TO_GREEN_METRICS_TOOL/docker/compose.yml up -d
```

Now you can reload and enable the daemon:

```bash
sudo systemctl daemon-reload
sudo systemctl enable green-coding-service
```

### Dockerfiles architecture explanation:

- The postgres container has a volume mount. This means that data in the database will persists between container removals / restarts
- The interconnect between the gunicorn and the nginx container runs through a shared volume mount in the filesystem. Both use the user `www-data` to read and write to a UNIX socket in `/tmp`
- all webserver configuration files are mounted on start of the container as read-only. This allows for changing configuration of the server through git-pull or manual editing without having to rebuild the docker image.
- postgresql can detect changes to the structure.sql. If you issue a `docker compose down -v` the attached volume will be cleared and the postgres container will import the database structure fresh.

## Metric providers

Some metric providers need extra setup before they work.

### LM-Sensors

The required libraries are installed automatically via the `install.sh` call. However for completeness, these
are the libraries installed:

{{< tabs groupId="sensors">}}
{{% tab name="Ubuntu" %}}

```bash
sudo apt install -y lm-sensors libsensors-dev libglib2.0-0 libglib2.0-dev
```

{{% /tab %}}
{{% tab name="Fedora" %}}

```bash
sudo dnf -y install lm_sensors lm_sensors-devel glib2 glib2-devel
```

{{% /tab %}}
{{< /tabs >}}

If you want the temperature metric provider to work you need to run the sensor detector

```bash
sudo sensors-detect
```

in order to detect all the sensors in your system. One you have run this you should be able to run the

```bash
sensors
```

command and see your CPU temp. You can then use this output to look for the parameters you need to set in the `config.yml`.
For example if sensors gives you:

```bash
coretemp-isa-0000
Adapter: ISA adapter
Package id 0:  +29.0°C  (high = +100.0°C, crit = +100.0°C)
Core 0:        +27.0°C  (high = +100.0°C, crit = +100.0°C)
Core 1:        +27.0°C  (high = +100.0°C, crit = +100.0°C)
Core 2:        +28.0°C  (high = +100.0°C, crit = +100.0°C)
Core 3:        +29.0°C  (high = +100.0°C, crit = +100.0°C)
```

Your config could be:

```bash
lm_sensors.temperature.provider.LmSenorsTempProvider:
    resolution: 100
    chips: ['coretemp-isa-0000']
    features: ['Package id 0', 'Core 0', 'Core 1', 'Core 2', 'Core 3']
```

As the matching is open ended you could also only use `'Core'` instead of naming each feature.

### XGBoost

The XGBoost metrics provider can estimate the power consumption of the total
system (AC-Energy).

It is included as a submodule in the Green Metrics Tool and should have been checked out with the
initial install command of this manual. If not run:

```bash
git submodule update --init
```

It must be supplied with the machine params in the `config.yml` file:

- CPUChips
- HW_CPUFreq
- CPUCores
- TDP
- HW_MemAmountGB

Please look at the always current documentation here to understand what values to
plug in here: [XGBoost SPECPower Model documentation](https://github.com/green-coding-berlin/spec-power-model)

Also the model must be activated by uncommenting the appropriate line with *...PsuEnergyAcXgboostSystemProvider*

Lastly, if you don't have them already, you need to install some python libraries:

```bash
python3 -m pip install -r ~/green-metrics-tool/metric_providers/psu/energy/ac/xgboost/system/model/requirements.txt
```

### DC Metrics Provider

This providers needs a custom piece of hardware to work:

- [PicoLog HRDL ADC-24](https://www.picotech.com/data-logger/adc-20-adc-24/precision-data-acquisition)

Please look for details in the provider documentation at [PsuEnergyDcPicologSystemProvider →]({{< relref "/docs/measuring/metric-providers/psu-energy-dc-picolog-system" >}})

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

TODO!

No thorough documentation on this yet! However you have to configure NGINX
accordingly so that it finds the SSL credentials and certificate.
This is done in the `/docker/nginx/frontend.conf`.
