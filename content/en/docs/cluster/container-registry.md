---
title: "Container Registry"
description: "A description on how to run a local container registry with GMT"
date: 2025-06-26T01:49:15+00:00
weight: 1009
---

GMT does **not** come with a container registry bundled. But since it builds on *docker* it can benefit from it's capability to query a private container registry.

Here we just want to show you the steps we took to get it running. Please consult the manuals of the respective tool vendors for configuration details

## Why would you set up a container registry

GMT will download images on measurement and keep them in the cache by default. If you just measure software inside their containers this usually poses no issue.
But if you also want to caputre and evaluate host level metrics you will notice that over time the disk will fill up with images.

To always have a clean system you can instruct GMT to delete images on every run and pull images fresh. To not incur the costly network traffic every time you can pull these images only from the local network, effectively centralizing the location where images are kept.

If you run GMT in cluster mode you will then benefit from having the machines always with a clean file sytem and pulling from a central registry that keeps the images cached.

## Container Registry

We choose [registry](https://hub.docker.com/_/registry) which is the *CNCF* supported and most used library. It comes with a reference
implementation that is suffcient for local or setups behind NATs.

Our compose file for the registry:

```yml
services:
  registry:
    image: registry:3
    container_name: registry
    restart: always
#    ports: # do not make available directly to the outside
#      - "5001:5000"  # internal, accessed via nginx
    environment:
      REGISTRY_PROXY_REMOTEURL: https://registry-1.docker.io
      REGISTRY_STORAGE_DELETE_ENABLED: "false"
      OTEL_TRACES_EXPORTER: none
    volumes:
      - /mnt/cluster_caches/docker:/var/lib/registry # we expect a storage system mounted on /mnt/cluster_caches/docker ... for instance an SSD

  nginx:
    image: nginx:alpine
    container_name: registry-nginx
    restart: always
    ports:
      - "5000:5000"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

Our *NGINX* file:

```nginx

worker_processes 1;

events { worker_connections 1024; }

http {
    server {
        listen 5000;

        location /v2/ {
            limit_except GET HEAD { # we do not want to let people store images. Unsure if OPTIONS should also be allowed ...
                deny all;
            }
            proxy_pass http://registry:5000;
        }
    }
}
```

To have these servers always running we use a *systemd* service in `~/.config/systemd/user/container-registry.service`:

```bash
[Unit]
Description=Start Container Registry with NGINX

[Service]
ExecStart=%h/container-registry/startup-docker.sh
Type=simple
Restart=on-failure
RestartSec=5s
StartLimitBurst=10
StartLimitInterval=0

[Install]
WantedBy=default.target]
```

And a startup script in `~/container-registry/startup-docker.sh`:

```bash
#!/bin/bash
docker context use rootless
docker compose -f ~/container-registry/compose.yml up -d
```

Since the container registry we created is *insecure* (aka not using TLS) *docker* needs special allowance to use it.

In the `daemon.json`:

```json
{
  ...
  "insecure-registries": ["YOUR_IP:5000"],
}
```

### Security

It is highly recommended to have docker rootless active for the docker daemon on the machine that runs the registry!

See [Docker Rootless →]({{< relref "/docs/installation/installation-linux" >}}) how to do that.

TLS is only required if your registry is public accessible. If you have it local or behind a NAT with only
controlled machines, it is not needed.

### Set your registry as default

In the `daemon.json`:

```json
{
  ...   
  "registry-mirrors": ["http://YOUR_IP:5000"]
}
```

### Limit access to only your registry

The default *docker CLI* will always fail-over to Docker Hub.

If you do not want that you should block it on DNS level, which is the safest.

Add to `/etc/hosts`:

```log
0.0.0.0 registry-1.docker.io auth.docker.io
```

### Test your registry

Try with *curl*:

- `$ curl -s http://YOUR_IP:5000/v2/_catalog`
