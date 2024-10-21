---
title: "Installation of a Cluster"
description: "A description on how to run the GMT in a cluster with NOP Linux"
lead: ""
date: 2023-06-26T01:49:15+00:00
weight: 904
---

## Cluster setup

It is possible to run the Green Metrics Tool (GMT) in a cluster setup. You can find the current setup that our [Hosted Service]({{< relref "/docs/measuring/measuring-service" >}}) uses in the specification of our [Measurement Cluster]({{< relref "/docs/measuring/measurement-cluster" >}}). Through this it is possible to use specialized hardware, benchmark different systems and offer Benchmarking as a Service (BaaS). It is advised to run your database and GMT backend on a different machine as these could interfere with the measurements. The cluster setup is designed to work on headless machines and job submission is handled through the database. Also job status can be sent via email. This is done so that once the machine is configured no manual intervention is needed anymore.

When submitting a job, a specific machine can be specified on which this job is then exclusively run. The configuration can be machine specific, as we want certain machines to have specific metric providers. We advise to not have unutilized machines running all the time for the case if a job might be submitted. Please think about switching off a machine when it is not used and power it up once a day or when the sun is shining.

There are two main ways to configure a cluster:

## 1) NOP Linux

When benchmarking software it is important to have reproducible results between runs. In the past it often occurred that some OS background process would kick in while a benchmark was running and such the resource usage did not reflect the actual usage. To combat this we developed NOP Linux with the aim to reduce noise in measurements.

This documentation page does not document how to create a NOP Linux machine but rather what component's the Green Metrics Tool has to facilitate running on a measurement server. Even if you are not using a specialized Linux distribution it is advised to adhere to the ideas presented here.

For a detailed description on how to produce your own NOP Linux instance visit [our blog article on NOP Linux](https://www.green-coding.io/blog/nop-linux/).

The `tools/client.py` program is a script that should constantly be running and that periodically checks the database if a new job has been queued for this certain machine. If no job can be retried it sleeps for a certain amount of time set in the configuration file `config.yml`:

```yml
client:
  sleep_time_no_job: 300
  sleep_time_after_job: 300
```

You can also set a time that the script should wait after a job has finished execution to give the system time to cool down. Please use the [calibrate script]({{< relref "calibration" >}}) to fine tune this value.

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
ExecStart=/home/gc/green-metrics-tool/venv/bin/python3 /home/gc/green-metrics-tool/tools/client.py
StandardOutput=append:/var/log/green-metrics-client-service.log
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
sudo touch /var/log/green-metrics-client-service.log
sudo chown gc:gc /var/log/green-metrics-client-service.log
systemctl --user daemon-reload # Reload the systemd configuration
systemctl --ser enable green-coding-client # enable on boot
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
ExecStart=/home/gc/green-metrics-tool/venv/bin/python3 /home/gc/green-metrics-tool/tools/client.py
StandardOutput=append:/var/log/green-metrics-client-service.log
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

⚠️ We do not recommend using the cronjob implementation in production as it does not support temperature checking or sytem cleanups. This mode should only be used for local quick testing setups, when you cannot use NOP Linux. ⚠️

The Green Metrics Tool comes with an implemented queuing and locking mechanism. In contrast to the NOP Linux implementation this way of checking for jobs doesn't poll with a process all the time but relies on cron which is not available on NOP Linux.

You can install a cronjob on your system to periodically call:
- `python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project` to measure projects in database queue
- `python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py email` to send all emails in the database queue

The `jobs.py` uses the python3 faulthandler mechanism and will also report to *STDERR* in case
of a segfault.
When running the cronjob we advice you to append all the output combined to a log file like so:

`* * * * * python3 PATH_TO_GREEN_METRICS_TOOL/tools/jobs.py project &>> /var/log/green-metrics-jobs.log`

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

To have the most stable result benchmarking machines should have:

- Turbo Boost turned on
- Hyper Threading turned on
- DVFS turned on
- Allow C8-C0 states

All of these settings can be tweaked best in the BIOS. Additionally for turning DVFS off we recommend booting the kernel with `intel_pstate` CPU frequency driver deactived and using the `acpi` one which allows for setting the `userspace` govenor.

```
$ nano /etc/default/grub

# Change this line
# GRUB_CMDLINE_LINUX_DEFAULT=""
# to 
# GRUB_CMDLINE_LINUX_DEFAULT="intel_pstate=disable acpi=force"

$ update-grub

$ cat <<EOF > /etc/systemd/system/fix-cpu-frequency.service
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


$ systemctl enable fix-cpu-frequency
$ systemctl start fix-cpu-frequency

$ cat /proc/cpuinfo | grep MHz # to check that frequency is fixed
```

### Client

The GMT refers to *client* when it is talking about the settings for the `client.py` settings only.

When using the *client* mode the cluster expects a *Measurement Control Workload* to be set to determine if the cluster accuracy has deviated from the expected baseline. This is done by running a defined workload and checking the standard deviation over a defined window of measurements.

We recommend the following setting by using our provided workload under :
```yml
cluster:
  client:
    ...  
    time_between_control_workload_validations: 21600
    send_control_workload_status_mail: True
    ...
    control_workload:
      name: "Measurement control Workload"
      uri: "https://github.com/green-coding-berlin/measurement-control-workload"
      filename: "usage_scenario.yml"
      branch: "main"
      comparison_window: 5
      phase: "004_[RUNTIME]"
      metrics:
        psu_energy_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        psu_power_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_power_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_energy_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        cpu_energy_rapl_msr_component:
          threshold: 0.01 # 1%
          type: stddev_rel
        psu_co2_ac_mcp_machine:
          threshold: 0.01 # 1%
          type: stddev_rel
        network_total_cgroup_container:
          threshold: 10000 # 10 kB
          type: stddev
        phase_time_syscall_system:
          threshold: 0.01 # 1%
          type: stddev_rel
```

- `time_between_control_workload_validations` **[integer]**: Time in seconds until control workload shall be run again to check measurement std.dev.
- `send_control_workload_status_mail` **[boolean]**: Send an email with debug information about current std.dev.
- `control_workload` **[dict]**: (Dictionary of settings for measurement control workload)
  + `name` **[string]**: The name of the workload. Will show up in the runs list as the name
  + `uri` **[URI]**: URI to the git repo of the control workload.
  + `filename` **[a-zA-Z0-9_]**: The filename of the *usage scenario* file in the repo. Default is usually `usage_scenario.yml`
  + `branch` **[git-branch]**: The branchname of the repo to check out
  + `comparison_window` **[integer]**: The amount of previuous measurements to include in the std.dev. calculations.
  + `phase` **[str]**: The phase to look at. default is *004_[RUNTIME]*. We do not recommend to change this unless you have a custom defined phase you want to look at.
  + `metrics` **[dict]**: Contains a dictionary of all the metrics you want to check the STDDEV or relative STDDEV. Every metric is looked at individually and if the thresshold is exceeded of any of them the cluster will pause further job processing. Checks can be either relative or absolute. We recommend using relative where possible and absolute only of you very small values for the relevant metric and even small changes will lead to high relative changes. We further recommend using the default set as defined above if you have these metric providers enabled. If you do not have these providers available we recommend choosing at least one `psu_energy_...` provider that actually measures and does not estimation. The names are found in the *Metric Name* section of the respective metric provider.\
  Example: [RAPL CPU →]({{< relref "/docs/measuring/metric-providers/cpu-energy-RAPL-MSR-component" >}}) is `cpu_energy_rapl_msr_component`
  


## Power saving in the cluster

### Wake-on-LAN

When the cluster is setup it is often not needed to have the machines powered when there is no job in the queue.

What you can setup is a simple Wake-on-LAN script that will only wakeup the machines when there is job in the queue waiting.

For examplary purposes we document a script here that works on a low power *Raspberry PI* that we have active in our 
local network, but any simple microcontroller that has HTTP capabilites will.

```bash
#!/bin/bash
# filename: wake_machine.sh


# Install this script as a cronjob
# m h  dom mon dow   command
# 15\/* * * * * bash /home/pi/wake_machine.sh

## You need the wakeonlan and the jq package installed
## sudo apt install wakeonlan jq -y


output=$(curl "https://api.green-coding.io/v1/jobs?machine_id=7&state=WAITING" --silent  |  jq '.["data"] | length')

# Check if the output is a specific string
if [[ "$output" =~ ^[0-9]+$ && $output -ne 0 ]]; then
    echo "Having waiting jobs. Sending Wake on LAN magic packet ..."

    # Please replace '80:1B:3E:A8:26:19' with your machines MAC address
    # Using port 1234 will usually work. If you run into issues try port 9, 8 or 7 also
    # Do not use the IP address of the machine, but the broadcast address (usually the last number block must be replaced by 255)
    wakeonlan -i 10.1.0.255 -p 1234 80:1B:3E:A8:26:19

    echo "Wake on LAN magic packet send!"
else
    echo "Command output is '0'. No other program started."
fi
```

### Turning machine off on empty queue
To use this functionality you should have *Wake-on-LAN* activated.

You can then set the `shutdown_on_job_no` to *True* and the machine will turn off when the job queue is empty.

```yml
cluster:
  client:
    ...  
    shutdown_on_job_no: True
```

In order for the shutdown to be triggered by the `client.py` you must allow the `sudo` call without password in an `/etc/sudoers.d/` entry.

Example:
```bash
echo 'ALL ALL=(ALL) NOPASSWD:/usr/bin/systemctl suspend' | sudo tee /etc/sudoers.d/green-coding-shutdown
sudo chmod 500 /etc/sudoers.d/green-coding-shutdown
```

