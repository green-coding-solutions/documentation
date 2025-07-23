---
title: "Uninstallation"
description: "Uninstallation"
date: 2024-09-30T01:49:15+00:00
weight: 307
toc: false
---

Green Metrics Tool provides an `uninstall.sh` script in the root of the repository. [Direct link](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/uninstall.sh)

You can run it like this:

```bash
bash uninstall.sh
```

The script will remove all installed python libraries, all docker containers and optional
also the pre-install requirements like docker etc.

It has the option to keep your data by leaving *PostgreSQL* and it's *docker volume* installed
