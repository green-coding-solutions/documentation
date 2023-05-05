---
title: "Troubleshooting"
description: "Solutions to common problems."
lead: "Solutions to common problems."
date: 2022-06-18T08:49:15+00:00
draft: false
images: []
menu: 
  docs:
    parent: "help"
weight: 620
toc: true
---

## Browser cannot open Green Metrics Tool Frontend / ERR_CONNECTION_REFUSED

When you are getting an unexpected result when accessing localhost / \*.internal domain or a different website gets served / 404 / 403 check:

- Caching problem, please open Developer tools in your browser and check the *Disable Cache* option under *Network*
- Not having the hostname set correctly in `/etc/hosts` for development:

```txt
127.0.0.1 metrics.green-coding.internal api.green-coding.internal
127.0.0.1 green-coding-postgres-container

```

- Not accessing the Green Metrics Tool with the additional supplied port: `http://metrics.green-coding.internal:9142`
- It could be that you have other containers running and the port is overloaded, so that some
other service serves content on that port. Check your `docker ps -a`
- Also check `lsof -i | grep PORTNUMBER` to look if something on your host OS is serving content on that port

## ERR_NAME_NOT_RESOLVED / DNS_PROBE_POSSIBLE

- Hostname of container correct? `docker ps` tells you the container name, which is also the hostname
- Are the containers on the same network? Check with `docker inspect CONTAINER_ID`
- Can access the container through browser when mapping the ports to the host OS? (See also debug mode for this)

## Working `docker compose` setup, but not in GMT
- Some features that are standard of the [compose file](https://docs.docker.com/compose/compose-file/compose-file-v2/) might not be implemented. Check our [Docs](https://docs.green-coding.berlin) if a feature you need is implemented.
- Are you accessing with `http://localhost` ? This will not work in the GMT as it makes an internal network for the containers and does not know anything about the host machines. Please use the container names here.

## Run fails because *volumes*, *environment* or *ports* are in the `usage_scenario.yml`

- If you just copied your `docker-compose.yml` and wanted to reuse it but do not need the functionality, then consider using the `--skip-unsafe` flag.
- If you need the functionality then consider the `--allow-unsafe` flag

## Run on macOS fails

Either with the error `Base exception occured in runner.py:  no element found` or `xml.parsers.expat.ExpatError`

This is due to a current bug with the reading of the XML output of the powermetrics reporter.

Easiest fix: Just try the run again. The error happens seldomly and is random. 

[Please consult this ticket for current status of the bugfix](https://github.com/green-coding-berlin/green-metrics-tool/issues/286)

## Submodule issues

If you run into any conflicts just deinit and reinit the submodule in question:

```bash
git submodule deinit FOLDER -f
git submodule update --init FOLDER
git submodule init FOLDER
```

## Failing to compile LM sensors

On Ubuntu 20.04, the `glib` does not contain the function `g_string_replace`:

```bash
Building binaries ...
Installing ./metric_providers/lm_sensors/metric-provider-binary ...
make: Entering directory '/home/user/green-metrics-tool/metric_providers/lm_sensors'
gcc source.c chips.c -o3 -Wall -Llib -lsensors -lglib-2.0 -I/usr/include/glib-2.0 -I/usr/lib/x86_64-linux-gnu/glib-2.0/include -o metric-provider-binary
source.c: In function ‘main’:
source.c:326:17: warning: implicit declaration of function ‘g_string_replace’; did you mean ‘g_tree_replace’? [-Wimplicit-function-declaration]
  326 |                 g_string_replace(chip_feature_str, " ", "-", 0);
      |                 ^~~~~~~~~~~~~~~~
      |                 g_tree_replace
/usr/bin/ld: /tmp/cc0Vs2qj.o: in function `main':
source.c:(.text+0xbcc): undefined reference to `g_string_replace'
collect2: error: ld returned 1 exit status
make: *** [Makefile:8: binary] Error 1
make: Leaving directory '/home/user/green-metrics-tool/metric_providers/lm_sensors'
```

To resolve this, update the `glib` package:

```bash
sudo apt install libglib2.0-dev
```

## General tips

- Always check container logs with `docker compose logs`. Sometimes streaming logs
does not work that well when orchestrating multiple containers and polling the directly gives you all logs.
- Add the `--debug` switch to your local calls to the `runner.py` to enter the stepping debug mode of the tool.
- Add `--allow-unsafe` to the call to `runner.py` and *ports* to your [usage_scenario.yml →]({{< relref "usage-scenario" >}}) to access containers through your browser in the host OS to check if the containers are delivering the expected output.
- Rebuild the containers with `docker compose down -v` and then `docker compose up -d`
- Re-run the `install.sh` script to get new configuration changes that you maybe have not yet applied after an update
