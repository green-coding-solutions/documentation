---
title : "Interacting with applications"
description: "Interacting with applications"
lead: ""
date: 2022-06-18T08:48:45+00:00
draft: false
images: []
---

We will here guide you through the concept of interacting with the containers
through the Green Metrics Tool.

We provide an example for a terminal application, as well as for a web application.

The result will be a `usage_scenario.yml` file. ([Specification →]({{< relref "usage-scenario" >}}))

## Command line app

TODO

```json

```

## Web app
```json
{
    "name": "Wordpress Data Puppeteer Scenario",
    "author": "Arne Tarara",
    "version": 1,
    "architecture": "linux",
    "setup": [
        {
            "type": "network",
            "name": "my-network"
        },
        {
          "name": "mariadb-container",
          "type": "container",
          "identifier": "wordpress-mariadb-data_db",
          "env": {
            "MYSQL_ROOT_PASSWORD": "somewordpress",
            "MYSQL_DATABASE": "wordpress",
            "MYSQL_USER": "wordpress",
            "MYSQL_PASSWORD": "wordpress"
          },
          "network": "my-network"
        },
        {
          "name": "green-coding-wordpress-apache-data-container",
          "type": "container",
          "identifier": "wordpress-mariadb-data_wordpress",
          "env": {
              "WORDPRESS_DB_HOST": "green-coding-wordpress-mariadb-data-container",
              "WORDPRESS_DB_USER": "wordpress",
              "WORDPRESS_DB_PASSWORD": "wordpress",
              "WORDPRESS_DB_NAME": "wordpress"
          },
          "network": "my-network",
          "folder-destination": "/tmp/repo",
          "setup-commands": [
              "cp /tmp/repo/wordpress.conf /etc/apache2/sites-enabled/wordpress.conf",
              "cp -R /tmp/repo/html /var/www/wordpress-green-coding"
          ]
        },
        {
            "name": "green-coding-puppeteer-container",
            "type": "container",
            "identifier": "puppeteer_green-coding-puppeteer",
            "setup-commands": ["cp /tmp/repo/puppeteer-flow.js /var/www/puppeteer/puppeteer-flow.js"],
            "network": "my-network"
        }
    ],
    "flow": [
        {
            "name": "Check Website",
            "container": "green-coding-puppeteer-container",
            "commands": [
                {
                    "type": "console",
                    "command": "node /var/www/puppeteer/puppeteer-flow.js"
                }
            ]
        }
    ]
}
```

If you came here from the [Containerizing Applications →]({{< relref "containerizing-applications" >}}) Tutorial
please check a full version for the last example at our [Example app repository](https://github.com/green-coding-berlin/example-applications/tree/main/wordpress-mariadb-data)