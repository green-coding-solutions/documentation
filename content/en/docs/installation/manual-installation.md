---
title: "Manual Installation"
description: "Manual Installation"
lead: ""
date: 2019-06-06T08:49:15+00:00
lastmod: 2020-10-06T08:49:15+00:00
draft: false
images: []
---

Having done all the steps as instructed on [Installation Overview →]({{< relref "installation-overview" >}}), you can now proceed to the manual installation of our tool.

## Postgres
```bash
sudo -i -u postgres

createuser my_user -P # and then type password

createdb --encoding=UTF-8 --owner=my_user my_user # DB is often already created with previous command

psql # make sure you are postgres user (whoami)
```

this command in psql: ```ALTER USER my_user WITH SUPERUSER;```

leave the psql shell (ctrl+d) and also logout of "postgres" bash

```bash
psql -U my_user # needs PW entry
```

this command in psql: ```CREATE EXTENSION "uuid-ossp";```

leave the psql shell (ctrl+d)

make sure you are a postgres user with ```sudo -i -u postgres```

```bash
psql
```

this command in psql: ```ALTER USER my_user WITH SUPERUSER;```

leave the psql shell (ctrl+d) and logout of "postgres" bash

now we import the structure. Please use the file from the ```Docker``` subfolder:

```bash
psql -U my_user < /var/www/green-metrics-tool/docker/structure.sql
```

### Postgres Remote access (optional)

check first if 12 is really used version and then maybe replace number in next command

```bash
echo "listen_addresses = '*'" >> /etc/postgresql/12/main/postgresql.conf

sudo nano /etc/postgresql/12/main/pg_hba.conf
```

add the following lines to the config. It must come BEFORE any lines that are talking about "peer" authentication.
Otherwise peer authentication will be prefered and password login will fail in python3-psycopg2:

```bash
host my_user my_user 0.0.0.0/0 md5
local my_user my_user md5
```

maybe even remove other hosts as needed. Then reload

```bash
sudo systemctl reload postgresql
```

## Webservice and API
we are using ```/var/www/green-metrics-tool/frontend``` for static files and as document root and ```/var/www/green-metrics-tool/api``` for the API

all must be owned by www-data (or the nginx user if different)

```bash
sudo chown -R www-data:www-data /var/www
```

now we replace the references in the code with the real server address you are running on ```cd /var/www/green-metrics-tool```

The server responds on requests to ```http://metrics.green-coding.local:8000``` for the interface
and on ```http://api.green-coding.local:8000``` for the API.

Please set an entry in your ```/etc/hosts``` file accordingly like so:

```bash
127.0.0.1 api.green-coding.local metrics.green-coding.local
```

## Configuring the command line application

Create the file ```/var/www/green-metrics-tool/config.yml``` with the correct Database and SMTP credentials. A sample setup for the file can be found in ```/var/www/green-metrics-tool/config.yml.example```

### Gunicorn

test if gunicorn is working in general ```cd /var/www/green-metrics-tool/api && gunicorn --bind 0.0.0.0:5000 wsgi:app```

if all is working, we create the service for gunicorn ```sudo nano /etc/systemd/system/green-coding-api.service```

paste this:

```bash
[Unit]
Description=Gunicorn instance to serve Green Coding API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/green-metrics-tool/api
ExecStart=/bin/gunicorn --workers 3 --bind unix:/tmp/green-coding-api.sock -m 007 api:app --user www-data -k uvicorn.workers.UvicornWorker --error-logfile /var/log/gunicorn-error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now green-coding-api.service
```

### NGINX

```bash
sudo nano /etc/nginx/sites-available/green-coding-api
```

Paste this:

```bash
server {
    listen 80;
    server_name api.green-coding.org api.green-coding.local;

    location / {
        include proxy_params;
        proxy_pass http://unix:/tmp/green-coding-api.sock;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/green-coding-api /etc/nginx/sites-enabled/
```

and we also must change the default document root

```bash
sudo nano /etc/nginx/sites-available/default
```

here you must modify the root directive to: ```root /var/www/green-metrics-tool/frontend;```

Then reload all: ```sudo systemctl restart nginx```

***Now create a snapshot of the machine to reload this state later on***

## Testing the command line application

First you have to create a project through the web interface, so the cron runner will pick it up from the database.

Go to [http://metrics.green-coding.local:8000/request.html](http://metrics.green-coding.local:8000/request.html) Note: You must enter a Github Repo URL with a repository that has the usage_scenario.json in a valid format. Consult [Github Repository for the Demo software](https://github.com/green-coding-berlin/green-metric-demo-software) for more info

After creating project run:

```bash
/var/www/green-metrics-tool/tools/runner.sh cron
```

## Implement a cronjob (optional)

Run this command as the user for which docker is configured: ```crontab -e```

Then install following cron for ```root``` to run job every 15 min:

```bash
*/15 * * * * python3 /var/www/green-metrics-tool/tools/runner.py cron
```

If you have no MTA installed you can also pipe the output to a specific file like so:

```bash
*/15 * * * * python3 /var/www/green-metrics-tool/tools/runner.py cron 2>&1 >> /var/log/cron-green-metric.log
```

If you have docker configured to run in rootless mode be sure to issue the exports for the cron command beforehand. A cronjob in the ```crontab -e``` of the non-root may look similar to this one:

```bash
DOCKER_HOST=unix:///run/user/1000/docker.sock */5 * * * * export PATH=/home/USERNAME/bin:$PATH; python3 /var/www/green-metrics-tool/tools/runner.py cron 2>&1 >> /var/log/cron-green-metric.log
```

Also make sure that ```/var/log/cron-green-metric.log``` is writeable by the user:

```bash
sudo touch /var/log/cron-green-metric.log && sudo chown MY_USER:MY_USER /var/log/cron-green-metric.log
```

### Locking and Timeout for cron

Depending on how often you run the cronjob and how long your jobs are the cronjobs may interleave which will cause problems.

On a typical Linux system you can use timeout / flock to prevent this. This example creates a exclusive lock and timeouts to 4 minutes

```bash
DOCKER_HOST=unix:///run/user/1000/docker.sock */5 * * * * export PATH=/home/USERNAME/bin:$PATH ; timeout 240s flock -nx /var/lock/greencoding-runner python3 /var/www/green-metrics-tool/tools/runner.py cron 2>&1 >> /var/log/cron-green-metric.log
```