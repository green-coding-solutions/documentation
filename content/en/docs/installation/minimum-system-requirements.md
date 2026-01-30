---
title: "Minimum system requirements"
description: "Minimum system requirements"
date: 2024-10-09T01:49:15+00:00
weight: 301
toc: true
---

### CPU

At least an SSE2-compatible processor is required;
For macOS a 64bit-compatible Intel processor (Core2Duo or newer) or an M1 ARM or newer is required.

The CPU must have at least **two physical threads** available (in case of SMT / Hyperthreading it should be 4 threads).

### Memory

- ~ 1 GB

Please note that this only covers the running of the Green Metrics Tool itself. Typical overhead just for orchestrating the container will be an additonal ~500 MB
If you instruct it to measure your software the system will use more memory according to the needs of your measured application.

### Hard-Disk

- ~ 3 GB GB

Please note that this only covers the installation of the Green Metrics Tool itself. If you instruct it to measure your software it will pull the relevenat docker containers and check out the given *git* repository which will require more disk space during usage.

This disk space is however only determined by the size of the measured software product.

### OS

- Linux: Kernel 4.0 or newer. On Ubuntu 18.04 or newer.
- Windows: Windows 10 or newer
- macOS: 10.15 or newer

### Additional software

The Green Metrics Tool is utilizing *Python3*, *git* and *docker* as it's core components.

Furthermore many of the reporters are written in C.

You need these tools installed and a build chain to compile C programs.

Please look in the respective installation details for the OS, where all these programs will be listed and how to install them.

- [Installation Linux]({{< relref "installation-linux" >}})
- [Installation macOS]({{< relref "installation-macos" >}})
- [Installation Windows]({{< relref "installation-windows" >}})
