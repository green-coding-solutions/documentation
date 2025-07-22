---
title : "Deleting measurements"
description: "How to delete measurements locally"
lead: ""
date: 2023-07-06T08:48:45+00:00
weight: 422
---

## Removing failed measurements in the CLI

If you have accumulated some failed measurements but want to get rid of the data, there is the functionality
to prune the database of these failed measurements.

Please run:

```bash
python3 tools/prune_db.py
```

## Removing all measurements in the CLI

If you instead want to remove all measurements you can use the `--all` switch:

```bash
python3 tools/prune_db.py --all
```

## Why is there no function in the online interface?

We believe that all measurements are valuable, even if they failed fully or contained only partial data.

In the [Hosted Service]({{< relref "measuring-service" >}}) that we provide in particular, as only there you can see
the debug logs if you need them.

However even partial data can provide insights as there might be an energy related reason why a measurement failed
due to resource congestion, overheating etc.

What could be possible though is a login mechanism for the web interface that would allow the creator to delete their
own measurement. Because it would introduce currently unwanted complexity we decided to not include it for now.

If you however want your measurement removed from our online metrics collection at [https://metrics.green-coding.io](https://metrics.green-coding.io)
please shoot us an email to info@green-coding.io
