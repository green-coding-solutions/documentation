---
title: "User Management"
description: "User Management in cluster mode"
lead: ""
date: 2024-12-23T01:49:15+00:00
weight: 1005
---

In the FOSS version of GMT only two base users are configured and every action can be executed with them:
- USER 1 - The default user
- USER 0 - The GMT system user running control workloads and sending e-mails

## Default user

By default *USER 1* has full capabilities and can access all resources.

The *USER 1* has the token *DEFAULT* by default.

## Authentication mechanism

Running jobs on the CLI needs no authentication, however a *user_id* can be supplied to attribute a run to a certain user (See [Runner Switches →]({{< relref "/docs/measuring/runner-switches.md" >}}))

For API access an authentication header has to be supplied with name *X-Authentication*.

Here is an example cURL request:

```bash
    API_TOKEN='DEFAULT'
    curl -X POST https://api.green-coding.io/v1/runs \
         -H "X-Authentication: ${API_TOKEN}"
```

**Important:** If no *X-Authentication* header is supplied the API will still authenticate *USER 1* by default. 

## Features of User Management

For complex usage cases GMT comes with a user management system that allows:
- Restricting certain routes to view content (GET)
- Restricting certain routes for submission of measurements, CI runs, Hog Data etc. (POST)
- Allowing longer / shorter data retention times for certain users
- Enabling *Super Admins* that can access all resources
- Restricting access to certain machines to run measurement jobs on
- Putting measurement quotas in place to be used for to certain machines to run measurement jobs on
- Restricting certain types of optimizations
- Restricting view access to content from other / selective users
- Allowing badge access to the public, but restricting everything else

Please note that the user management system is bundled with GMT but managed and fully documented as part of the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) package.
Furthermore many features like needed maintenance jobs / cron jobs and ACL generators are only shipped with the [Enterprise](https://www.green-coding.io/products/green-metrics-tool/) version.

We believe that user management is only needed in bigger corporate settings and thus we encourage you to support this project by considering upgrading to a [paid version](https://www.green-coding.io/products/green-metrics-tool) which includes the User Management either included in the SaaS version or the Enterprise version.