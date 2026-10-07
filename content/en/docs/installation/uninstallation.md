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

The script will remove all installed python libraries, all docker containers and images and optional
also the pre-install requirements like docker etc.

It has the option to keep your data: The *PostgreSQL* container and image are always removed, but the
*docker volume* that holds your measurement data is only removed if you confirm the prompt.

{{< callout context="caution" icon="outline/alert-triangle" >}}
As its very last step the script deletes the whole repository directory it is run from (`rm -fR`). Make sure you have copied out anything you want to keep, for example your `config.yml`, before running it.
{{< /callout >}}
