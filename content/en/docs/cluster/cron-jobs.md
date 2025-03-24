---
title: "Cron Jobs"
description: "Cron Jobs to be executed in the Green Metrics Tool"
lead: ""
date: 2024-10-25T01:49:15+00:00
weight: 102
---

All *cron jobs* can be found in the `/cron` directory.

They must be run periodically through an external trigger, for instance through `crontab` or a service.

This page provides examples how we setup the *cron jobs*. Adjust the times and frequency to your needs.

```
# m h  dom mon dow   command
SHELL=/bin/bash

## Deprecated! We do not recommend to use the cron feature to schedule jobs
#*\/5    *       *       *       *       PATH_TO_GMT/venv/bin/python3 PATH_TO_GMT/tools/jobs.py project &>> /var/log/green-metrics-jobs.log

## We recommend to trigger the email job every 2 minutes
## You can trigger it more often, as it has a locking mechanism. The mechanism is however not fully parallel safe and email processing is not done in a transaction which might lead to race conditions if multiple connections to the DB in parallel try to set the DB lock.
*\/2     *       *       *       *       PATH_TO_GMT/venv/bin/python3 PATH_TO_GMT/cron/jobs.py email &>> /var/log/green-metrics-jobs.log

## If you only run daily or weekly projects this needs to only run once a day
## If you use the commit or tag feature we recommend every 15 minutes
15     *       *       *       *       PATH_TO_GMT/venv/bin/python3 PATH_TO_GMT/cron/watchlist.py schedule &>> /var/log/green-metrics-jobs.log

## If you use CarbonDB you must at least update and compress once a day. 
## If you want more current data run this more often.
## Beware that this job is costly and can run up to multiple minutes if you have a large database
20      *       *       *       *       PATH_TO_GMT/venv/bin/python3 PATH_TO_GMT/cron/carbondb_compress.py &>> /var/log/green-metrics-jobs.log
9       *       *       *       *       PATH_TO_GMT/venv/bin/python3 PATH_TO_GMT/cron/carbondb_copy_over_and_remove_duplicates.py &>> /var/log/green-metrics-jobs.log

```

Be sure to create and give the `green-metrics-jobs.log` file write access rights.

Also be aware that our example for the cronjob assumes your crontab is using `bash`.
Consider adding `SHELL=/bin/bash` to your crontab if that is not the case.
