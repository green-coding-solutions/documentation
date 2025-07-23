---
title: "Files & Folders"
description: "Infos on the directory structure and important files in the GMT"
date: 2024-10-25T07:49:15+00:00
weight: 202
toc: true
---


## Python venv include paths

GMT uses the Python `.pth` magic file mechanism to force an always enabled include path.

The file will be created when you run the *install* script and will be located under `./venv/lib/python3.XX/site-packages/gmt-lib.pth`

This mechanism was chosen as it provides the least friction and allows to run the CLI functions of the GMT with a normall `python3 xxx.py` .

Alternatively in the future we might consider running GMT as a module command (`python3 -m`) or as a system wide available executable.

## Folder structure

- `api`
    - Contains all python files for the FastAPI api and will be linked into the running docker container
- `cron`
    - Contains runnable scripts that are executed as cron jobs 
- `data`
    - Contains demo data to import for testing and debugging
- `docker`
    - Includes the docker container Dockerfiles and compose files as well as the NGINX configurations
- `frontend`
    - Includess all HTML and JS files including JS libraries for the Dashboard
- `lib`
    - Includes *Python* and *C* libraries the GMT includes during installation and execution
- `metric_providers`
    - Includes the modular *metric providers*
- `migrations`
    - Includes DB migrations in *SQL* format to run after upgrading from one version to another
- `optimization_providers`
    - Includes the modular *optimization providers*
- `tests`
    - Includes the *Python* unit- and E2E-tests
- `tools`
    - Includes maintenance and debugging scripts to be executed via CLI
- `venv`
    - Contains the `python3` virtual environment