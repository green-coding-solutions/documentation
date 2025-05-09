---
title: "Cluster Installation"
description: "A description on how to run the GMT in a cluster with NOP Linux"
lead: ""
date: 2023-06-26T01:49:15+00:00
weight: 101
---

## Cluster setup

For production setups it is possible to run the Green Metrics Tool (GMT) in a cluster setup. You can find the current setup that our [Hosted Service]({{< relref "/docs/measuring/measuring-service" >}}) uses in the specification of our [Measurement Cluster]({{< relref "/docs/measuring/measurement-cluster" >}}). Through this it is possible to use specialized hardware, benchmark different systems and offer Benchmarking as a Service (BaaS). It is advised to run your database and GMT backend on a different machine as these could interfere with the measurements. The cluster setup is designed to work on headless machines and job submission is handled through the database. Also job status can be sent via email. This is done so that once the machine is configured no manual intervention is needed anymore.

When submitting a job, a specific machine can be specified on which this job is then exclusively run. The configuration can be machine specific, as we want certain machines to have specific metric providers. We advise to not have unutilized machines running all the time for the case if a job might be submitted. Please think about switching off a machine when it is not used and power it up once a day or when the sun is shining.

There are two main ways to configure a cluster:

## 1) Systemd Service - Client mode

The `tools/client.py` program is a script that should constantly be running and that periodically checks the database if a new job has been queued for this certain machine. If no job can be retried it sleeps for a certain amount of time set in the configuration file `config.yml`:

```yml
client:
  sleep_time_no_job: 300
  sleep_time_after_job: 300
```

You can also set a time that the script should wait after a job has finished execution to give the system time to cool down. Please use the [calibrate script]({{< relref "/docs/installation/calibration" >}}) to fine tune this value.

After running a job the client program executes the `tools/cluster/cleanup.sh` script that does general house keeping on the machine. This is done in a batch fashion to not run when a benchmark is currently run.

To make sure that the client is always running you can create a service that will start at boot and keep running.

{{< tabs groupId="mode">}}
{{% tab name="Docker-Rootless-Mode" %}}
\
Create a file under: `~/.config/systemd/user/green-coding-client.service`:

```init
[Unit]
Description=The Green Metrics Client Service
After=docker.target

[Service]
Type=simple
WorkingDirectory=/home/gc/green-metrics-tool/
ExecStart=/home/gc/green-metrics-tool/venv/bin/python3 -u /home/gc/green-metrics-tool/cron/client.py
Restart=always
RestartSec=30s
TimeoutStopSec=600
KillSignal=SIGINT
RestartKillSignal=SIGINT
FinalKillSignal=SIGKILL

[Install]
WantedBy=default.target
```

Then activate the service
```bash
systemctl --user daemon-reload # Reload the systemd configuration
systemctl --user enable green-coding-client # enable on boot
systemctl --user start green-coding-client # start service

systemctl --user status green-coding-client # check status
```

{{% /tab %}}
{{% tab name="Docker-Root-Mode" %}}
\
Create a file under: `/etc/systemd/system/green-coding-client.service`:


```init
[Unit]
Description=The Green Metrics Client Service
After=network.target

[Service]
Type=simple
User=gc
Group=gc
WorkingDirectory=/home/gc/green-metrics-tool/
ExecStart=/home/gc/green-metrics-tool/venv/bin/python3 -u /home/gc/green-metrics-tool/tools/client.py
Restart=always
RestartSec=30s
TimeoutStopSec=600
KillSignal=SIGINT
RestartKillSignal=SIGINT
FinalKillSignal=SIGKILL

Environment="DOCKER_HOST=unix:///run/user/1000/docker.sock"

[Install]
WantedBy=multi-user.target
```

Then activate the service
```bash
sudo systemctl daemon-reload # Reload the systemd configuration
sudo systemctl enable green-coding-client # enable on boot
sudo systemctl start green-coding-client # start service

sudo systemctl status green-coding-client # check status
```

{{% /tab %}}
{{< /tabs >}}


You should now see the client reporting it's status on the server. It is important to note that only the client ever talks to the server (polling). The server never tries to contact the client. This is to not create any interrupts while a measurement might be running.

After running a job the client program executes the `tools/cluster/cleanup.sh` script that does general house keeping on the machine. This is done in a batch fashion to not run when a benchmark is currently run.

This script is run as root and thus needs to be in the `/etc/sudoers` file or subdirectories somewhere. We recommend the following:

```bash
echo 'ALL ALL=(ALL) NOPASSWD:/home/gc/green-metrics-tool/tools/cluster/cleanup.sh ""' | sudo tee /etc/sudoers.d/green-coding-cluster-cleanup
sudo chmod 500 /etc/sudoers.d/green-coding-cluster-cleanup
```

## 2) Cronjob (DEPRECATED)

⚠️ We do not recommend using the cronjob implementation in production as it does not support temperature checking or system cleanups. This mode should only be used for local quick testing setups, when you cannot use NOP Linux. ⚠️

The Green Metrics Tool comes with an implemented queueing and locking mechanism. In contrast to the NOP Linux implementation this way of checking for jobs doesn't poll with a process all the time but relies on cron which is not available on NOP Linux.

You can install a cronjob on your system to periodically call:
- `python3 -u PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project` to measure projects in database queue
- `python3 -u PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py email` to send all emails in the database queue

The `jobs.py` uses the *Python* faulthandler mechanism and will also report to *STDERR* in case of a segfault.
When running the cronjob we advice you to append all the output combined to a log file like so:

`* * * * * python3 -u PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project &>> /var/log/green-metrics-jobs.log`

Be sure to give the `green-metrics-jobs.log` file write access rights.

Also be aware that our example for the cronjob assumes your crontab is using `bash`.
Consider adding `SHELL=/bin/bash` to your crontab if that is not the case.

## General settings

### Machine

When using the cluster you will need to configure the machine names in the `machines` table in the database and set the corresponding value in the `config.yml`:

```yml
machine:
  id: 1
  description: "My Machine Name"
  base_temperature_value: 30
  base_temperature_chip: "coretemp-isa-0000"
  base_temperature_feature: "Package id 0"
```
The `id` and the `description` must be unique so that they do not conflict with the other machines in the cluster.

If you are using the *NOP Linux* setup with the `client.py` service you must also setup the temperature checking. Find out what your system has when it is cool. You can either use our calibration script or just let the machine sit for a while until the temperature does not change anymore. Then set the value `base_temperature_value`. It has no unit, but is rather just a value in degree (°). It should have the same unit as your output of `sensors` on your Linux box.

Since we are using our [lm_sensors provider →]({{< relref "/docs/measuring/metric-providers/lm-sensors" >}}) to query the temperature you must also set the `base_temperature_chip` and `base_temperature_feature` to query from. Refer to the [provider documentation →]({{< relref "/docs/measuring/metric-providers/lm-sensors" >}}) for more details.

#### Profiling Machines

Machines that are intended to create a carbon profile *as it would be seen in a user machine* should have:
- Turbo Boost turned on
- Hyper Threading turned on
- DVFS turned on
- Allow C8-C0 states

This is the minium set we deem reasonable. Please note that this resembles a user machine the best. For server machines some of these configurations should be changed. For servers Hyper Threading is often turned on whereas DVFS is often turned off.


#### Benchmarking Machines

To have the most stable result benchmarking machines or if you want to use Container Energy Estimations based on CPU Utilization you should have:

- Turbo Boost turned off
- Hyper Threading turned off
- DVFS turned off
- Allow only C0 state

All of these settings can be tweaked best in the BIOS. Additionally for turning DVFS off we recommend booting the kernel with `intel_pstate` CPU frequency driver deactived and using the `acpi` one which allows for setting the `userspace` govenor.

```
$ sudo nano /etc/default/grub

# Change this line
# GRUB_CMDLINE_LINUX_DEFAULT=""
# to 
# GRUB_CMDLINE_LINUX_DEFAULT="intel_pstate=disable acpi=force"

$ sudo update-grub

$ cat <<EOF | sudo tee /etc/systemd/system/fix-cpu-frequency.service
[Unit]
Description=Fix CPU Frequency

[Service]
Type=oneshot
ExecStart=/usr/bin/cpupower frequency-set -g userspace
ExecStartPost=/usr/bin/cpupower frequency-set -f 2.1GHz
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF


$ sudo systemctl enable fix-cpu-frequency

# Reboot here!

$ sudo systemctl start fix-cpu-frequency

$ cat /proc/cpuinfo | grep MHz # to check that frequency is fixed
```

### Client

The GMT refers to *client* when it is talking about the settings for the `client.py` settings only.

When using the *client* mode the cluster expects a *Measurement Control Workload* to be set to determine if the cluster accuracy has deviated from the expected baseline.

Please see [Accuracy Control →]({{< relref "accuracy-control" >}}) for details.

