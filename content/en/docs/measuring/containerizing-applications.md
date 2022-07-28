---
title: "Containerizing own applications"
description: ""
lead: ""
date: 2022-06-20T07:49:15+00:00
draft: false
images: []
toc: true
---

When containerizing your application we rely images either available on [dockerhub](https://hub.docker.com/)
or being local on your system.

This tutorial will walk you through the design process of containerizing a sample
web application on Wordpress and comparing it to a static copy of the site in terms of energy.

This tutorial assumes that your app is not already containerized. If it already is go
to [Measuring locally →]({{< relref "measuring-locally" >}})

## Containerization General

When containerizing apps for the Green Metrics Tool the containers must not shut 
down after starting them.
So you either must have a daemon / process running inside the container that keeps 
the container running or use the `cmd` option in the [usage_scenario.yml →]({{< relref "usage-scenario" >}}) 
file to start a shell that keeps the container running.

The reason for that is, that our tool sends the commands to the containers after they
have all been instantiated and does not support one-off container starts with parameters.

## Containerizing web app (Wordpress)

We will use wordpress as an example.

Our architecture looks as the following:

<img src="/img/server-architecture-banana.webp">

(Since we still had space in the picture we attached a Banana for reference)

We will now containerize the webserver, the database and also the client inside in a separate container.

The reason for this scoping is that the Green Metrics Tool reports on a container level
and we are interested in showing these metrics separately.

Technically you could also measure the architecture without the client side, but we
believe that the energy consumption of software includes both sides as well as the
network part.

👉  To learn how we calculate network energy consumption [Network Metrics Provider →]({{< relref "network" >}})

### Webserver

We are basing the container off `wordpress:latest`, which includes our webserver as 
well as the PHP runtime.

In the container we want the webserver to listen on port 9875, therefore we have
to create a new virtual host.
The virtualhost should have a hostname identical to the container. We set this
container name later, so see it as given for the moment.

```bash
Listen 9875
<VirtualHost *:9875>
    DocumentRoot /var/www/html
    ServerName green-coding-wordpress-apache-data-container
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    <Directory /var/www/html>
        Options FollowSymLinks
        AllowOverride Limit Options FileInfo
        DirectoryIndex index.php
        Require all granted
    </Directory>
    <Directory /var/www/html/wp-content>
        Options FollowSymLinks
        Require all granted
    </Directory>
</VirtualHost>
```

We will now create the Dockerfiles as follows:
```bash
# Dockerfile-wordpress
FROM wordpress:latest
EXPOSE 9875
COPY ./html /var/www/html
COPY ./wordpress.conf /etc/apache2/sites-enabled/wordpress.conf
````

By copying the `wordpress.conf` to the apache vhost directory we let webserver know
to deliver the website on port `9875` for host `green-coding-wordpress-apache-data-container`

{{< alert icon="💡" text="As you can see we are letting the container expose port 9875. This is usually very helpful for debugging to let internal / testing containers to be run at ports greater 1024" />}}


### Database

We assume a [MariaDB database](https://mariadb.org/) and will base of
their [basic image](https://hub.docker.com/_/mariadb).

We pull a dump from our database and copy the wordpress filesystem:
```bash
mkdir /tmp/demo-app
mysqldump -u USERNAME -p DATABASE_NAME > /tmp/demo-app/wordpress-dump.sql
cp -R /PATH/TO/WORDPRESS /tmp/demo-app/html
```


We will now create the Dockerfiles as follows:
```bash
# Dockerfile-mariadb
FROM mariadb:10.6.4-focal
COPY ./wordpress-dump.sql /docker-entrypoint-initdb.d/wordpress-dump.sql
EXPOSE 3306
````

As you can see we are copying the dump inside the database container.
Thanks to some magic from the folks at MariaDB this container image will automatically
pick up the dump and import it.



Now for the `compose.yml`:
```bash
services:
  db:
    build:
      context: .
      dockerfile: Dockerfile-mariadb
    container_name: green-coding-wordpress-mariadb-data-container
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=somewordpress
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wordpress
      - MYSQL_PASSWORD=wordpress
    expose:
      - 3306
  wordpress:
    build:
      context: .
      dockerfile: Dockerfile-wordpress
    container_name: green-coding-wordpress-apache-data-container
    expose:
      - 9875
    ports:
      - 9875:9875
    restart: always
    environment:
      - WORDPRESS_DB_HOST=db
      - WORDPRESS_DB_USER=wordpress
      - WORDPRESS_DB_PASSWORD=wordpress
      - WORDPRESS_DB_NAME=wordpress
    depends_on:
      - db
```

{{< alert icon="👉" text="Please change the passwords accordingly to the ones that your wordpress wp-config.php has if you supply one. Otherwise the MariaDB magic will create the database for you." />}}

### Puppeteer for client side

In order to simulate a client we need a container running a headless browser.

We choose Puppeteer and provide an exemplary container to build here: https://github.com/green-coding-berlin/example-applications/tree/main/puppeteer and to be directly used from [Docker Hub](https://hub.docker.com/greencoding)


### Finish

You are now done containerizing your web application.

All you need is a flow to interact from the Puppeteer container with the webserver.
Have a look at the tutorial on: [Interacting with application →]({{< relref "interacting-with-applications" >}})

Afterwards run the measurements. 
An example how to run a measurement locally you can find here: [Measuring locally →]({{< relref "measuring-locally" >}})

To see all final files in an example of what we introduced here go to the [Example app](https://github.com/green-coding-berlin/example-applications/tree/main/wordpress-mariadb-data)
