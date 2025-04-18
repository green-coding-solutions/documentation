---
title: "NOP Linux"
description: "NOP Linux setup for machines in the Green Metrics Tool cluster"
lead: ""
date: 2024-10-25T01:49:15+00:00
weight: 103
---

When benchmarking software it is important to have reproducible results between runs. It often occurrs that some OS background process would kick in while a benchmark was running and such the resource usage did not reflect the actual usage. To combat this we developed NOP Linux with the aim to reduce noise in measurements.

We recommend tuning the Linux OS on all linux measurement machines that you have in your cluster to get the highest reproducability out of your measurement runs.

The following script configures an Ubuntu 22.04+ system to have no active timers running, remove all unneeded services and disable also
NTP.

The goal is to keep the system still very close to a production / user setup, but remove invariances from the system without 
decreasing idle power draw and skewing results.

Please further note that you must execute certain service still periodically. The [client.py](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/cron/client.py) cluster service will periodically run [a cleanup script](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/tools/cluster/cleanup_original.py)

```bash
#!/bin/bash
set -euox pipefail

# this is a patch. Firefox seems to have a trick to remove read-only filesystem. We need to unmount that first
sudo umount /var/snap/firefox/common/host-hunspell || true

# remov all snaps first as they mount read only filesystem that only snap itself can find and unmount
for i in {1..3}; do # we do this three times as packages depends on one another
    for snap_pkg in $(snap list | awk 'NR>1 {print $1}'); do sudo snap remove --purge "$snap_pkg"; done
done


# Remove all the packages we don't need
sudo apt purge -y --purge snapd cloud-guest-utils cloud-init apport apport-symptoms cryptsetup cryptsetup-bin cryptsetup-initramfs curl gdisk lxd-installer mdadm open-iscsi snapd squashfs-tools ssh-import-id wget xauth update-notifier-common python3-update-manager unattended-upgrades needrestart command-not-found cron lxd-agent-loader modemmanager motd-news-config pastebinit packagekit
sudo systemctl daemon-reload
sudo apt autoremove -y --purge

# Get newest versions of everything
sudo apt update

sudo apt install psmisc -y

# on some versions killall might be missing. Please install then
sudo killall unattended-upgrade-shutdown

sudo apt upgrade -y

# These are packages that are installed through the update
sudo apt remove -y --purge networkd-dispatcher multipath-tools

sudo apt autoremove -y --purge

# These are user running services
systemctl --user disable --now snap.firmware-updater.firmware-notifier.timer
systemctl --user disable --now launchpadlib-cache-clean.timer
systemctl --user disable --now snap.snapd-desktop-integration.snapd-desktop-integration.service


# Disable services that might do things
sudo systemctl disable --now apt-daily-upgrade.timer
sudo systemctl disable --now apt-daily.timer
sudo systemctl disable --now dpkg-db-backup.timer
sudo systemctl disable --now e2scrub_all.timer
sudo systemctl disable --now fstrim.timer
sudo systemctl disable --now motd-news.timer
sudo systemctl disable --now e2scrub_reap.service
sudo systemctl disable --now tinyproxy.service
sudo systemctl disable --now  anacron.timer


# these following timers might be missing on newer ubuntus
sudo systemctl disable --now systemd-tmpfiles-clean.timer
sudo systemctl disable --now fwupd-refresh.timer
sudo systemctl disable --now logrotate.timer
sudo systemctl disable --now ua-timer.timer
sudo systemctl disable --now man-db.timer

sudo systemctl disable --now sysstat-collect.timer
sudo systemctl disable --now sysstat-summary.timer

sudo systemctl disable --now systemd-journal-flush.service
sudo systemctl disable --now systemd-timesyncd.service

sudo systemctl disable --now systemd-fsckd.socket
sudo systemctl disable --now systemd-initctl.socket

sudo systemctl disable --now cryptsetup.target

sudo systemctl disable --now power-profiles-daemon.service
sudo systemctl disable --now thermald.service
sudo systemctl disable --now anacron.service



# Packages to install for editing and later bluetooth. some of us prefer nano, some vim :)
sudo apt install -y vim nano bluez

# Setup networking
NET_NAME=$(sudo networkctl list "en*" --no-legend | cut -f 4 -d " ")
cat <<EOT | sudo tee /etc/systemd/network/en.network
[Match]
Name=$NET_NAME

[Network]
DHCP=ipv4
EOT

# Disable NTP
sudo timedatectl set-ntp false

# Disable the kernel watchdogs
echo 0 | sudo tee /proc/sys/kernel/soft_watchdog
echo 0 | sudo tee /proc/sys/kernel/nmi_watchdog
echo 0 | sudo tee /proc/sys/kernel/watchdog
echo 0 | sudo tee /proc/sys/kernel/watchdog_thresh

# Removes the large header when logging in
sudo rm /etc/update-motd.d/*

# Remove all cron files. Cron shouldn't be running anyway but just to be safe
sudo rm -R /etc/cron*

sudo apt autoremove -y --purge

# Desktop systems have NetworkManager. Here we want to disable the periodic check to Host: connectivity-check.ubuntu.com.
if [ -f "/etc/NetworkManager/NetworkManager.conf" ]; then
    echo "[connectivity]" >> /etc/NetworkManager/NetworkManager.conf
    echo "uri=" >> /etc/NetworkManager/NetworkManager.conf
    echo "interval=0" >> /etc/NetworkManager/NetworkManager.conf
else
    echo "NetworkManager configuration file seems not to exist. Probably non desktop system"
fi

# List all timers and services to validate we have nothing left
sudo systemctl list timers
systemctl --user list-timers

echo "All done. Please reboot system!"
```