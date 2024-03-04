---
title : "Demo project data"
description: "Demo project data."
lead: ""
date: 2023-02-23T15:49:15+00:00
weight: 1006
---


We have added demo data that will provide you with two projects that have all our working reporters active (apart from the macOS and time reporters).

This helps if you have a clean database and no access to some linux reporters, for instance.
The demo data is in the Green Metrics Tool repository under the folder `data`, and an importer script in `/tools`.

The usage of the script would be:

```bash
python3 tools/import_data.py data/demo_data.sql
```
