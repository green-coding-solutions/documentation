---
title: "cgroup memory provider"
description: "cgroup memory provider"
lead: ""
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
---

TODO
Reads from `/sys/fs/cgroup/user.slice/user-%s.slice/user@%s.service/user.slice/docker-%s.scope/memory.current
- User id is assumed to be 1000 - hardcoded for now. Will not work properly if it is different

- Arguements:
    -s: string of containerids, comma seperated
    -i: interval in milliseconds between measurements
        - should this be standadized across metric providers to be milliseconds for all?

- Mention CGROUP1 and CGROUP2 differences

- OUTPUT:
    - check code
    - container ID