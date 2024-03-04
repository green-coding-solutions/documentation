---
title: "Installation on Windows"
description: "A description on how to install the GMT on Windows machines"
lead: ""
date: 2023-12-04T01:49:15+00:00
weight: 903
---

{{< alert icon="⚠" text="Running the GMT on Windows with WSL is only meant for development and testing of usage scenarios! It is not possible to use this setup for actual measurements!" />}}

GMT can only run on Windows with the [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/) (WSL). Before installing GMT make sure you have a working WSL environment.

With WSL you are working with a real Linux distribution (e.g. Ubuntu). Therefore, the most installation steps are equal to the ones documented in [Installation on Linux →]({{< relref "installation-linux#downloading-and-installing-required-packages" >}}). On this page we only document the things that are different.

If you ever get stuck during this installation, be sure to reboot WSL once. It may help to correctly load some configurations and/or daemons.

## Docker Desktop for Windows

Docker provides a great installation help on their website: [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/)

You can just use the Docker Desktop for Windows bundle. Make sure the WSL 2 feature is enabled.

## Setup

Before following the setup instructions given in [Installation on Linux →]({{< relref "installation-linux#setup" >}}), make sure the automatic generation of the hosts file is disabled.

### Disable automatic generation of hosts file

```bash
sudo vim /etc/wsl.conf
```

Add the following two lines:

```bash
[network]
generateHosts = false
```

Reference: [https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/](https://devblogs.microsoft.com/commandline/automatically-configuring-wsl/)

### Add hosts entries to Windows

To be able to access the frontend and the API of the GMT, you have to add the URLs to the hosts file on your Windows host system: `C:\Windows\System32\drivers\etc\hosts`

```plain
127.0.0.1 green-coding-postgres-container
127.0.0.1 api.green-coding.internal metrics.green-coding.internal
```

### Metric providers

With WSL it is not possible to measure anything except the CPU utilization via procfs (`cpu.utilization.procfs.system.provider`).

You have to disable all other providers in your `config.yml`.
