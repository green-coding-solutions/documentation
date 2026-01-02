---
title: "Overview"
description: "CarbonDB is a time-series database for storing and retrieving carbon and energy metrics"
date: 2026-01-01T08:49:15+01:00
weight: 1
---

CarbonDB is a components of the Green Metrics Tool Suite to get an overview of your total organizations IT carbon emissions in real time.

Technicall it is a time-series database for storing and retrieving carbon and energy metrics.

## Data

- It can consume values either directly by ingesting them via API endpoint (`/vX/carbondb/add`) or
- Importing them from components of the Green Metrics Tool Suite like
  * `PowerHOG`
  * `ScenarioRunner`
  * `Eco CI`

## Architecture and Design

CarbonDB consists of the following components:

* **API**: A FastAPI application that provides a RESTful API for adding and retrieving data from CarbonDB.
* **Cron Jobs**: A set of cron jobs that are responsible for compressing and normalizing the data in CarbonDB.
* **Database**: A PostgreSQL database that is used to store the data which is co-integrated with the normal GMT cluster database

For ingestion and querying CarbonDB provides a lot of parameters that you set to cluster and tag your data.

- `type`: The type of the data (e.g., `machine.desktop`, `website`).
- `project`: The project that the data belongs to.
- `machine`: The machine that the data was collected from.
- `source`: The source of the data (e.g., `Power HOG`, `Eco CI`).
- `tags`: A list of tags that are associated with the data.

All of these parameters can be set when sending data to the API, when querying but also in other products like *Eco CI* when you import data from GMT internal sources.

### Merge Window

To make reports and data output from CarbonDB useful you need at some point certain views to be final.

CarbonDB by default has a merge-window of 30 days. Which means data is considered to be immutable after 30 days.
Up until this point you can still send "old" data to CarbonDB, for example energy data from 3 days ago.

After the merge window has passed and the timestamp of the data is to old CarbonDB will block direct inserts via API. The importer will only consider data that is less than 30 days old also.

## API

The easiest way to get data into CarbonDB is by sending data directly to the API.

The CarbonDB API provides the following endpoints:

* **/v2/carbondb/add**: This endpoint is used to add new energy data to CarbonDB. The data is sent in the form of a JSON object that contains the following core fields:
  * `time`: The timestamp of the data
  * `energy_uj`: The energy consumption in microjoules
  * `carbon_intensity_g`: The carbon intensity in g
  * `ip`: The IP that handed in the data (in case you are behind a NAT, VPN etc. )

The endpoints do directly backfill the IP if not explicitely supplied with the connecting IP. Carbon Intensity will not be backfilled automatically. For this a cronjob must be setup. See further down in the docs on this page.

* **/v2/carbondb**: This endpoint is used to retrieve data from CarbonDB. The data can be filtered by various parameters, such as `start_date`, `end_date`, `tags_include`, `tags_exclude`, etc.

You can find the always up to date documentation on the [self-documentating API]({{< relref "/docs/api" >}})

### Sending data example

We provide a minimal working example for a Linux agent that utilizes [Cloud Energy](https://github.com/green-coding-solutions/cloud-energy) to send the carbon emissions of a VM in your infrastructure constantly to CarbonDB.

👉 [CarbonDB Agent Linux](https://github.com/green-coding-solutions/carbondb-agent)

## Data Import

CarbonDB can import data from other GMT components like *Eco CI*, *ScenarioRunner* and *PowerHOG*.

To do so the Cronjobs must be setup.

Effectively data will then be copied over, de-duplicated and checked for consistency.

The *tags* and *projects* you manually set are retained. Some other fields like *source* and *type* are automatically set by the importer.

## Cron Jobs

Cronjobs are all placed in the `/cron` directory of GMT and are de-activated by default.

The following cron jobs are used to maintain the data in CarbonDB:

- **carbondb_copy_over_and_remove_duplicates.py**: This cron job copies data from other sources (e.g., `hog_simplified_measurements`, `ci_measurements`) into the `carbondb_data_raw` table. It also backfills missing carbon intensity data.
- **carbondb_compress.py**: This cron job compresses the raw data in `carbondb_data_raw` into daily sums. It also normalizes the data by transforming text fields into integers and storing them in separate tables.
- **backfill_geo.py**: This cron job will backfill geo information for IPs. They are needed to backfill carbon intensity which works on Geo coordinates.
  + The cron job only backfills IP data up to 30 days. Then it considers information to be outdate
  + Backfilling is done through three independent, fail-over Geo-IP Providers: ipinfo.io, ipapi.co and ip-api.com - They implementation requires no API key but may exhaust the free limit if you run a very large instance. So far this never happened ... contact us if it happened to you :)
- **backfill_carbon_intensity.py**: This cron job takes existing geo coordinates of data and matches it to current carbon intensity data
  - The cron job works with live carbon intensity API endpoints from Electricity Maps. This means it will only backfill data up to 30 minutes to not have out of date values. You must setup the cronjob at least every 15 minutes.
  - It requires the `electricity_maps_token` to be set in the `config.yml`
