---
title: "Example Applications"
description: "Contributing to the Example Applications 🥳🎉😍"
lead: "Contributing to the Example Applications 🥳🎉😍"
date: 2022-06-10T09:49:15+00:00
draft: false
images: []
weight: 630
toc: true
---

We welcome everybody to provide example applications with a Pull Requests on [Github](https://github.com/green-coding-berlin/example-applications)

Please be aware that in order to achieve the most gain for the community and
the goal to keep measurements reproducible and comparable we provide some
guidelines for the example applications:

## Characteristics
- All reference images in the [usage_scenario.json →]({{< relref "usage-scenario" >}}) must be
available on [dockerhub](https://hub.docker.com/)
- Containers are not allowed to require volume mounts

## Containers

If your application uses of one the service below, please use the recommended containers:

### Databases
- [MariaDB Official](https://hub.docker.com/_/mariadb)

### Interacting with Web Applications
- [Our Puppeteer Container](https://github.com/green-coding-berlin/example-applications/tree/main/puppeteer)

### Web Applications
#### Wordpress
Please do NOT use the [official wordpress container](https://hub.docker.com/_/wordpress)
for example applications.
The container is a breeze when you want to start from scratch, but very picky when you want
to overlay an exisiting filesystem.
- We recommend using [PHP Official + Apache](https://hub.docker.com/_/php) &raquo; Please use the tag: `php:8.0-apache`