---
title: "Advanced instrumentation"
description: ""
date: 2025-05-25T01:49:15+00:00
weight: 900
toc: true
---

GMT is designed to provide extremly low overhead as a measurement tool.

This is achieved by leveraging classic *docker* containers with native runtimes like *runc* (optionally with rootless, see down below).

To benchmark more complex applications however it might be necessary to use alternative
runtimes to leverage functionalities like:

- Docker in Docker
- Workloads that need systemd
- K8s or K3s inside of GMT
- Benchmarking alternative kernels and kernel modules with GMT

In the following we show runtimes supported by GMT and their pros, cons and caveats.

{{< callout context="caution" icon="outline/alert-triangle" >}}
Using a different runtime for the docker orchestrator will almost always result in more overhead. This path should only be choosen if no other way of running the workload is possible as the base system might get damaged or the measurement itself might not be possible or distorted/disturbed without the isolation.
{{< /callout >}}

## Kata Containers

[GitHub Repo](https://github.com/kata-containers/kata-containers/)

*Kata Containers* is a *containerd* compatible runtime that creates a *qemu VM* and launches a new *docker* container inside of it.

### Pros

- Highest degree of isolation
- Enables *docker-in-docker* workloads
- Enables *systemd* workloads
- Enables to load alternative kernels and kernel modules

### Cons

- Big overhead ... although not as big as gVisor
- Requires nested virtualization

### Caveats

- GMT orchestrated containers cannot be put on one network. This seems to be a bug ...
- Unclear if GPU forwarding is supported
- *systemd* workloads need patched image. So far not achieved to get running
- *docker-in-docker* workloads so far not achieved running although they should work

### Activating

Install *Kata Containers* and the just supply `--runtime io.containerd.kata.v2` as a `docker-run-args` in the *service* definition of your `usage_scenario.yml`

## Sysbox

[GitHub Repo](https://github.com/nestybox/sysbox)

*sysbox* enables bare metal workloads and provides a bit more isolation than normal docker containers by providing stronger namespaces that are effectively rootless.

### Pros

- Slightly higher degree of isolation. Although still very close to native *docker*
- Does not require nested virtualization
- Enables *docker-in-docker* workloads
- Enables *systemd* workloads

### Cons

- Biggest overhead of all runtimes
- Unclear if GPU forwarding is supported
- Cannot load other kernels or kernel modules

### Caveats

- Networking for *docker-in-docker* workloads seems to fail when containers are put on custom network. Network connection on the normal docker containers seems to work though. Suprisingly direct IP connects work, but DNS resolution fails for the *docker-in-docker* workloads
  - This can be mitigated at the moment by putting the containers on the *default bridge* network. This should have no further security implications
  - Alternatively one can also set a proxy for the docker container and forward the *HTTP_PROXY* variables to all applications that are started in the *docker-in-docker* containers.
  - Also alternatively all inner created docker containers in the container can be created with `--network=host` and will also retain connectivity.
  - Why the mitigations work is not exactly clear, but it might be related to this: https://github.com/nestybox/sysbox/issues/456. It seems clear however that it is a routing issue from the inner container to the internet but it suprising that either changing how the interface for the outer container is created can fix it as well as skipping creation the inner network adapter with `--network=host`.

### Activating

Install *sysbox* and the just supply `--runtime sysbox-runc` as a `docker-run-args` in the *service* definition of your `usage_scenario.yml`

## gVisor

*gVisor* emulates the whole kernel in user-space thus protecting the host kernel.

### Pros

- High degree of isolation. Probably on par with
- Does not require nested virtualization

### Cons

- Biggest overhead of all runtimes
- Unclear if GPU forwarding is supported

### Caveats

- Unclear if *systemd* workloads work
- Unclear if GPU forwarding is supported
- Unclear if *docker-in-docker* workloads work
- Unclear if it can load other kernels or kernel modules

**Note**: Currently in alpha and not officially supported. Ping us if you want to help developing this feature to a stable version :)

## Firecracker

[GitHub Repo](https://github.com/firecracker-microvm/firecracker-containerd)

*Firecracker* launches a micro-VM that can also be made *containerd* compatible through a shim.

### Caveats

- Unclear if *systemd* workloads work
- Unclear if *docker-in-docker* workloads work
- Unclear if it can load other kernels or kernel modules

**Note**: Currently in alpha and not officially supported. Ping us if you want to help developing this feature to a stable version :)

## Docker Rootless

*Docker Rootless* is the endorsed default runtime configuration of the *runc* runtime that ships with *docker* and is officially endorsed by GMT.

Making containers rootless comes with some trade-offs:

### Pros

- Higher security. If containers are escaped no true root is possible
- No *bridges* or *nftables* rules are created and might pollute host networking rules

### Cons

- Docker networking is completely done in user space via *slirp4netns* and thus very inefficient
- Configuration of *slirp4netns* is another tool to learn to create custom networking rules for docker containers

## More runtimes?

Technically more runtimes can be supported as long as they are *containerd* compatible.

This requirements comes from the fact that many native *docker* functionalities are used inside of GMT:

- `docker exec`
- `docker logs`
- `docker network`
- `docker run`
- `docker images`
- etc.
