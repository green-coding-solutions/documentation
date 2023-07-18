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

If Python dependencies have been updated, e.g. `requirements.txt` has been  
changed, then they need to be installed with:

```bash
    python3 -m pip install -r ~/green-metrics-tool/requirements.txt
```

## Re-Run the install script

After every new `git pull` you should run the `install.sh` script to get the  
newest binaries and configuration params for the Green Metrics Tool.

It will ask you for the database password every time. If you want to keep the database  
that you are currently using just type in the same password again.

Please note that your current `config.yml` will be *overwritten* and if you have made  
custom changes you need to replay them afterwards.

## Run the migrations

Typically we also advertise this in the Github Release Notes, but also check in the `/migrations` folder
if there is a migration with a date since you last updated.

To run a migration either paste the SQL code directly to the DB or use the `import_data.py` script.

Example:

```bash
python3 tools/import_data.py ./migrations/2023_07_08_indices.sql
``


## Read the Github release notes

If we release a new major version, or introduce breaking changes, we will post it  
there and also often on our [Company Blog](https://www.green-coding.berlin/blog).

If you ever get stuck during this installation, be sure to reboot the machine once.  
It may help to correctly load some configurations and/or daemons.

# Maintainer section

## Submodules

If you are a maintainer and want to push submodule changes,  
please only push the latest version with a depth=1:

```bash
git submodule update --remote
git add FOLDER
git commit -m "Submodule update"
git push
```

## Update PostgreSQL

An update is only necessary for major versions, for example from PostgreSQL 15.3 to 16.0, but not from 15.2 to 15.3


Although running PostgreSQL in a container provides many benfits updating to a major version is **not** one of them.
Sadly in order to update the DB the only proper way is exporting and importing.

Following steps must be executed:

```
# make sure the GMT is running and the postgres db container is started.
# you also need to have CLI access to the machine

cd ~/green-metrics-tool/docker
docker exec -u postgres green-coding-postgres-container pg_dump -p 9573 -C green-coding > /tmp/dump.sql
docker compose down -v # to delete current database volume
docker compose build # to upgrade image
docker compose  up -d
docker exec -it -u postgres green-coding-postgres-container psql -p 9573 -c 'DROP DATABASE "green-coding" WITH (FORCE);'
docker exec -i -u postgres green-coding-postgres-container psql -p 9573 < /tmp/dump.sql

```



