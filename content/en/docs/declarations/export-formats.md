---
title: "Export formats"
description: "Export formats from the database and API"
date: 2024-09-30T01:49:15+00:00
draft: false
images: []
weight: 700
toc: false
---

Green Metrics Tool is a free software and can run on your device with all the data under your ownership.

So by design every user can export all the data from the *PostgreSQL* through the open query language *SQL*.

Just connect to the *PostgreSQL* container and run `pg_dump`.

## Alternative export via API as JSON

All data is exposed through API endpoints documented for local installs under [http://api.green-coding.internal:9142](http://api.green-coding.internal:9142)
or if you use the hosted service under [https://api.green-coding.io](https://api.green-coding.io).

By issueing *GET* queries to the relevant endpoints all data can be exported as *JSON* format.
