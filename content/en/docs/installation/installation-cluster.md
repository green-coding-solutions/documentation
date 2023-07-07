---
title: "Installation of a Cluster"
description: "A description on how to run the GMT in a cluster with NOP Linux"
lead: ""
date: 2023-06-26T01:49:15+00:00
weight: 903
---

## Cluster setup

It is possible to run the Green Metrics Tool (GMT) in a cluster setup. You can find the current setupt that our [Hosted Service]({{< relref "/docs/measuring/measuring-service" >}}) uses in the specification of our [Measurement Cluster]({{< relref "/docs/measuring/measurement-cluster" >}}) Through this it is possible to use specialized hardware, benchmark different systems and offer Benchmarking as a Service (BaaS). It is advised to run your database and GMT backend on a different machine as these could interfere with the measurements. The cluster setup is designed to work on headless machines and job submission is handled through the database. Also job status can be sent via email. This is done so that once the machine is configured no manual intervention is needed anymore.

When submitting a job, a specific machine can be specified on which this job is then exclusively run. The configuration can be machine specific, as we want certain machines to have specific metric providers. We advise to not have unutilized machines running all the time for the case if a job might be submitted. Please think about switching off a machine when it is not used and power it up once a day or when the sun is shining.

There are two main ways to configure a cluster:

## 1) NOP Linux

When benchmarking software it is important to have reproducible results between runs. In the past it often occurred that some OS background process would kick in while a benchmark was running and such the resource usage did not reflect the actual usage. To combat this we developed NOP Linux with the aim to reduce noise in measurements.

This documentation page does not document how to create a NOP Linux machine but rather what component's the Green Metrics Tool has to facilitate running on a measurement server. Even if you are not using a specialized Linux distribution it is advised to adhere to the ideas presented here.

For a detailed description on how to produce your own NOP Linux instance visit our blog under [https://www.green-coding.berlin/blog/](https://www.green-coding.berlin/blog/).

The `tools/client.py` program is a script that should constantly be running and that periodically checks the database if a new job has been queued for this certain machine. If no job can be retried it sleeps for a certain amount of time set in the configuration file `config.yml`:

```yml
client:
  sleep_time: 300
```

After running a job the client program executes the `tools/cluster/cleanup.sh` script that does general house keeping on the machine. This is done in a batch fashion to not run when a benchmark is currently run.

To make sure that the client is always running you can create a service that will start at boot and keep running.

Create a file under: `/etc/systemd/system/green-coding-client-service.service` with following content

```init
[Unit]
Description=The Green Metrics Client Service
After=network.target

[Service]
Type=simple
User=gc
Group=gc
WorkingDirectory=/home/gc/green-metrics-tool/
ExecStart=/usr/bin/python3 /home/gc/green-metrics-tool/tools/client.py
Restart=always
RestartSec=30s

[Install]
WantedBy=multi-user.target
```

- Reload the systemd configuration by running:

```bash
sudo systemctl daemon-reload
```

- Start your new service:

```bash
sudo systemctl start green-coding-client-service
```

- Enable the service to run at boot:

```bash
sudo systemctl enable green-coding-client-service
```

- To check the status of your service, run:

```bash
sudo systemctl status green-coding-client-service
```

You should now see the client reporting it's status on the server. It is important to note that only the client ever talks to the server (polling). The server never tries to contact the client. This is to not create any interrupts while a measurement might be running.

## 2) Cronjob

The Green Metrics Tool comes with an implemented queuing and locking mechanism. In contrast to the NOP Linux implementation this way of checking for jobs doesn't poll with a process all the time but relies on cron which is not available on NOP Linux.

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

## General settings

When using the cluster you will need to configure the machine names in the `machines` table in the database and set the corresponding value in the `config.yml`:

```yml
machine:
  id: 1
  description: "Development machine for testing"
  # Takes a file path to log all the errors to it. This is disabled if False
  error_log_file: False
```
