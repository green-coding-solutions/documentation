---
title : "Interacting with applications"
description: "Interacting with applications"
lead: ""
date: 2022-06-18T08:48:45+00:00
weight: 803
---

When your application is prepared in containers you need to provide a starting  
point or set of actions that the application is going to process whilst our  
metric providers measure and read the metrics during this lifecycle.

In our terminology we call this a `flow`.

In the simplest case this is just a start command that will kick of some workload  
in one or more of the containers.

In a more complex form it is some kind of representation of a *standard usage scenario*  
that the application will experience in production.

Here we will guide you through one simple example with  
only one container that executes a terminal command.

Then we will show you one more complex example with an orchestration of  
three containers, where we simulate a user that accesses a web application.

The result will be a `usage_scenario.yml` file. ([Specification →]({{< relref "usage-scenario" >}}))

## Command line app

We will make the most basic example our tool can handle:

- Base off of **alpine** base container.
- Add the package `stress-ng` from `apk`
- Just run a 5 seconds stress run with default metrics providers

This is the resulting `usage_scenario.yml` file:

```yaml
name: Stress Container One Core 5 Seconds
author: Arne Tarara
version: 1
architecture: linux
services:
  simple-load-container:
    image: alpine
    setup-commands:
      - apk add stress-ng
 
 flow:
  - name: Stress
    container: simple-load-container
    commands:
      - type: console
        command: stress-ng -c 1 -t 5
        note: Starting Stress

```

The orchestration in the `services` part uses the standard alpine image and  
just installs an additional package into it: `stress-ng`

In the `flow` part we tell the container in the `commands` array that it shall  
run a command of type `console` and then provide the same string that we would type  
in directly if we were running a bash shell (or similar).

This example is representative of machine learning applications where you typically  
fire off one command (either train or infer) and then the applications runs one time  
until it finishes.

## Web app

In the sample for the web app we are reusing many parts of the `compose.yml` file from:  
[Containerizing applications →]({{< relref "containerizing-applications" >}})

We then add a `flow` part where we utilize a headless chrome browser to browse  
some sample subsites of the web application.

It is important to note that the image names we use here in this example are  
local docker images on our system, therefore the names can be different  
on your system and application.

The names in this example follow the naming in the example from [containerizing applications →]({{< relref "containerizing-applications" >}})

```yaml
networks:
  example-network:
services:
  db-container:
    image: demo_app_db
    environment:
      - MYSQL_ROOT_PASSWORD=somewordpress
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wordpress
      - MYSQL_PASSWORD=wordpress
    networks:
      - example-network
  wordpress-container:
    image: demo_app_wordpress
    ports:
      - 9875:9875
    restart: always
    environment:
      - WORDPRESS_DB_HOST=db
      - WORDPRESS_DB_USER=wordpress
      - WORDPRESS_DB_PASSWORD=wordpress
      - WORDPRESS_DB_NAME=wordpress
    networks:
      - example-network
  puppeteer-container:
    image: greencoding/puppeteer-chrome
    setup-commands:
      - cp /tmp/repo/puppeteer-flow.js /var/www/puppeteer-flow.js
    networks:
      - example-network

flow:
  - name: Check Website
    container: puppeteer-container
    commands:
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Puppeteer Flow
        read-notes-stdout: true
      - type: console
        command: sleep 30
        note: Idling
      - type: console
        command: node /var/www/puppeteer-flow.js
        note: Starting Puppeteer Flow again
        read-notes-stdout: true
```

Let's drill down on what is happening in this `usage_scenario.yml`:

- First the network is set up
- Then all services are defined and on which network they can communicate
  + This results in three services:
    * db-container: Our mariadb database based off a local image (Server side)
    * wordpress-container: Our Wordpress based off a local image (Server side)
    * puppeteer-container: Our headless chrome browser based off our custom image on docker hub (client side)
- Then a flow is defined which triggers Node to run a sequential flow to be executed by the headless Chrome
  + The flow runs one time, then a 30 second sleep occurs and then the flow is executed again
    * The reason being that this simulates a user more typically. You browse, you read, your browse again ... etc.

In our example here we picture the `puppeteer-flow.js` to be a file that you  
already have present in you end-to-end tests and can directly reuse.

### Communicating with containers inside the network

It is important that inside of this file you use the names of the containers as hostnames,  
because otherwise they cannot be found through the network.

The hostname to find the Wordpress container in this example would be `wordpress-container`.
In our example we also let it listen on port 9875 and it only accepts HTTP traffic.

A connect call would therefore be needed to be issued to: `http://wordpress-container:9875`

Here is an excerpt of an example `puppeteer-flow.js`:

```javascript
...
 await page.goto("http://wordpress-container:9875", {
    waitUntil: "networkidle2",
});

console.log(microtime.now()," Contact Page");
await page.click("a[href='http://wordpress-container:9875/?page_id=34']");

```
