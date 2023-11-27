---
title: "Network Connections - Proxy Container"
description: "Documentation for the NetworkConnectionsProxyContainerProvider for the Green Metrics Tool"
lead: ""
date: 2023-30-04T08:49:15+00:00
weight: 141
---

### What it does

This metric provider records all the external web resources that are requested by the build and the run of the
benchmark. Currently it only supports **http** and **https** connections but more might follow if requested. This is very
interesting when wanting to benchmark certain scenarios in which network traffic is important.

We use the great [tinyproxy](https://tinyproxy.github.io/) as it is very performant and doesn't add a lot of overhead
which might skew our measurements. Under Mac you need to install this by yourself with `brew install tinyproxy`!

It is worth highlight that this proxy only works with **external** resources. It does not report on inter-container network
communication. It also currently does not record the amount of data transferred. For this you can use our [Network I/O cgroup provider]({{< relref "network-io-cgroup-container" >}}).

The proxy implementation does not follow the "standard" way in which we define metric providers in that they echo a
key value pair to a file and this is then loaded into the measurements database. Instead it parses the output of the
proxy program and then adds the corresponding values to the `network_intercepts` database.

### Classname

- NetworkConnectionsProxyContainerProvider

### How it works

When starting the metric provider the `tinyproxy` program is started in the user space and mapped to the port 8889.
All log are written the the GMT log folder for later processing as the aim is to do the absolute minimal while
measuring. Once the `tinyproxy` has loaded all docker containers are started with the `httpProxy` and the `httpsProxy`
command line argument. A detailed description how to use docker proxies can be found
[here](https://docs.docker.com/network/proxy/). It is important to note that we don't set the proxy for the whole
docker daemon as this might interfere with other docker containers running on the same system but are not part
of our benchmark.

The docker container needs to be able to access the proxy running on the host system. While there is a standard domain
under Windows and Mac `host.docker.internal` which resolves to the host this is not available under Linux. If you
get a `Service not found` or similar error under Linux it is probably a problem with the ip resolution of the host
system. Please refer to the following configuration part to see how this can be mitigated.

### Configuration

The network proxy does not need any configuration by default. It is however possible to set the `host_ip` variable
if our logic does not resolve a correct ip on Linux.

```yml
common:
  network.proxy.proxy_provider.ProxyMetricsProvider:
    host_ip: 192.168.1.2
```

The `host_ip` needs to be reachable from inside of the container and the proxy needs to be accessible on port 8889.
Normally you don't neet to set the `host_ip` as we try to detect it. If this fails you can set it manually.

### Pitfalls

 Please make sure that tinyproxy is in your local path and installed. On Mac you can do this with `brew install tinyproxy`
   On Linux machines the install script should have taken care of the install.
