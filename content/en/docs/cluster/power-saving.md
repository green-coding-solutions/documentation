---
title: "Power Saving"
description: "Power saving in GMT cluster mode"
lead: ""
date: 2023-06-26T01:49:15+00:00
weight: 1006
---

## Wake-on-LAN

When the cluster is setup it is often not needed to have the machines powered when there is no job in the queue.

What you can setup is a simple Wake-on-LAN script that will only wakeup the machines when there is job in the queue waiting.

For examplary purposes we document a script here that works on a low power *Raspberry PI* that we have active in our 
local network, but any simple microcontroller that has HTTP capabilites will.

```bash
#!/bin/bash
# filename: wake_machine.sh


# Install this script as a cronjob
# m h  dom mon dow   command
# 15\/* * * * * bash /home/pi/wake_machine.sh

## You need the wakeonlan and the jq package installed
## sudo apt install wakeonlan jq -y


output=$(curl "https://api.green-coding.io/v1/jobs?machine_id=7&state=WAITING" --silent  |  jq '.["data"] | length')

# Check if the output is a specific string
if [[ "$output" =~ ^[0-9]+$ && $output -ne 0 ]]; then
    echo "Having waiting jobs. Sending Wake on LAN magic packet ..."

    # Please replace '80:1B:3E:A8:26:19' with your machines MAC address
    # Using port 1234 will usually work. If you run into issues try port 9, 8 or 7 also
    # Do not use the IP address of the machine, but the broadcast address (usually the last number block must be replaced by 255)
    wakeonlan -i 10.1.0.255 -p 1234 80:1B:3E:A8:26:19

    echo "Wake on LAN magic packet send!"
else
    echo "Command output is '0'. No other program started."
fi
```

### Turning machine off on empty queue
To use this functionality you should have *Wake-on-LAN* activated.

You can then set the `shutdown_on_job_no` to either "*poweroff*" or "*suspend*" and the machine will turn off when the job queue is empty.

```yml
cluster:
  client:
    ...  
    shutdown_on_job_no: suspend
```

In order for the shutdown to be triggered by the `client.py` you must allow the `sudo` call without password in an `/etc/sudoers.d/` entry.
Please choose the line that is appropriate for you depending on if you want to suspend or poweroff.

Example:
```bash
echo 'ALL ALL=(ALL) NOPASSWD:/usr/bin/systemctl suspend' | sudo tee /etc/sudoers.d/green-coding-shutdown # for systems that support suspend
echo 'ALL ALL=(ALL) NOPASSWD:/usr/bin/systemctl poweroff' | sudo tee -a /etc/sudoers.d/green-coding-shutdown # for systems that only can shutdown
sudo chmod 500 /etc/sudoers.d/green-coding-shutdown
```

### Activating Wake-On-Lan

In rare circumstances Wake-On-Lan is not active on the machine.

Check the following:
- Check the BIOS if Wake-On-Lan is enabled.
  + If no option is present it might not be configurable through the BIOS
- Check `$ sudo ethtool <YOUR_INTERFACE>`
  + Output should list: `Wake-on: g`

If the value is `d` it is disabled. You can activate it temporarily until the next suspend / reboot with: `$ sudo ethtool -s <YOUR_INTERFACE> wol g`

Persist it with a *systemd* service: `$ sudo nano /etc/systemd/system/wol.service`

```systemd
[Unit]
Description=Enable Wake-on-LAN on YOUR_INTERFACE
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/sbin/ethtool -s <YOUR_INTERFACE> wol g
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

### Activating suspend to ram

Instead of powering the system off you can also bring it to a suspend mode.

To really save power your system should support *Suspend to RAM*.

Check `$ cat /sys/power/state`. It should list `mem` as part of the output.

This means the OS supports bringing the system to *Suspend to RAM*.

Now check `$ cat /sys/power/mem_sleep`. A sample output looks like this:
```log
s2idle [deep]
```

If *deep* is in brackets all is good. If *s2idle* is in brackets you have the wrong setting.
To change the setting you can set a kernel boot parameter:

Add `mem_sleep_default=deep` to GRUB: `GRUB_CMDLINE_LINUX_DEFAULT="... mem_sleep_default=deep"`
Then `$ sudo update-grub` and reboot.

If your output is only *[s2idle]* then your network card driver or some other component does not support *Suspend to Ram* or is prohibiting it's activation.
For instance disabling CPU power saving modes can block this setting.
