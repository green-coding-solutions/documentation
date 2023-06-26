---
title: "Updating"
description: "Updating"
lead: ""
date: 2022-11-23T01:49:15+00:00
weight: 904
---

The standard way of updating the Green Metrics Tool is to run:
```bash
git pull # update the base files
git submodule update --init # update all the submodules
```

This will give you all the updated files.

Now we dive deeper in re-running the install script and restarting the containers,
 where you can opt to start fresh or keep most of your database / configuration.

## Rebuild and restart the containers

We will stop and rebuild the containers. Since the containers have a shared filesystem
that is independent of the container state your database will be kept as is.

However if a structural change to the database was included in the update you MUST
rebuild the database. We hopefully state this in the Github release tag ... but if you
run into unknown errors be sure to definitely rebuild the database.

```bash
cd ./docker
docker compose down  # stop containers
docker compose build # rebuild containers
docker compose down -v # optional!!! This will rebuild the database
docker compose up -d
```

## Re-install dependencies if needed

If python dependencies has been updated, e.g. `requirements.txt` has been
changed, then they need to be installed.

    sudo python3 -m pip install -r ~/green-metrics-tool/requirements.txt

## Re-Run the install script

After every new `git pull` you should run the `install.sh` script to get the newest binaries and configuration params for
the Green Metrics Tool.

It will ask you for the database password every time. If you want to keep the database
that you are currently using just type in the same password again.

Please note that your current `config.yml` will be overwritten and if you have made custom changes
you need to replay them afterwards.

## Read the Github release notes

If we release a new major version, or introduce breaking changes, we will post it there and also often on our [Company Blog](https://www.green-coding.berlin/blog)

If you ever get stuck during this installation, be sure to reboot the machine once. It may help to correctly load some configurations and/or daemons.


# Maintainer section

## Submodules
If you are a maintainer and want to push submodule changes please only push the latest version with a depth=1:
```bash
git submodule update --remote
git add FOLDER
git commit -m "Submodule update"
git push
```