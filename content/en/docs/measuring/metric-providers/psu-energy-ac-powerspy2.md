---
title: "PSU Energy - AC - Powerspy2"
description: "Documentation for PsuEnergyAcPowerspy2SystemProvider of the Green Metrics Tool"
lead: ""
date: 2023-01-03T20:16:35+0000
draft: false
images: []
weight: 161
---

### What it does

This metric provider uses the [PowerSpy2](https://www.alciom.com/en/our-trades/products/powerspy2/)
to read the power used by a device plugged into it. Normally this would be the device we are benchmarking.

The majority of the work is based on Volkers work that can be found under
[https://invent.kde.org/vkrause/powerspy2-tools](https://invent.kde.org/vkrause/powerspy2-tools).
Some influence from [https://github.com/patrickmarlier/powerspy.py](https://invent.kde.org/vkrause/powerspy2-tools)
We have modified Volkers version quite a bit so it is not possible to update via his repo. The powerspy gives you
quite a breath of values but we only use power (Watts) for this provider. More might come in the future.

The protocol documentation can be found under:
[www.alicom.com](https://www.alciom.com/wp-content/uploads/2018/04/LG0838-003-powerspy-protocol-specification-1G.pdf)
We opted for using the streaming solution which has some disadvantages because we couldn't get the logging to internal
memory to work reliable.


### Install

A detailed description can be found under [https://invent.kde.org](https://invent.kde.org/vkrause/powerspy2-tools)

1) You will need to install `pip install pyserial==3.5` into your environment.

1) You need to connect the powerspy through your operating systems bluetooth framework. For Ubuntu you can either do
this through `$ blueman-manager` or `bluetoothctl`. See
[https://simpleit.rocks/linux/shell/connect-to-bluetooth-from-cli/](
    https://simpleit.rocks/linux/shell/connect-to-bluetooth-from-cli/)
for more details.

1) Once you are connected you should be able to connect to the serial console by running
`# rfcomm connect /dev/rfcomm0 <addr> 1`
where addr is the mac address of your powerspy2 device. You can query this through `bluetoothctl devices`.
Please note that you will have to do this as root!

1) Make the rfcomm device read and writeable by all as root. `chmod 777 /dev/rfcomm0` This is potentially a security problem
if you are on a shared machine!

1) Please try running the metrics provider first to see if everything works.

### Classname

- PsuEnergyAcPowerspy2SystemProvider

### Input Parameters

To make the tool as useful as possible it takes multiple filter parameters:

- `--debug`: Gives you more debugging output and prints communication with the device.
- `--device`: The filesystem endpoint that should be used for communication. Please make sure it is readable and
  writeable by the calling process.
- `--interval`: Measurement interval in number of ms. Defaults to 1 second.
- `--unit`: Specify the unit, which should be one of: mW, W, mJ, J. Defaults to mW


```bash
> python3 metric-provider.py --unit mj --interval 250
```

### Output

This metric provider prints to stdout a continuous stream of data every `interval` milliseconds till it is stopped with
`sigkill` or `sigint` (Ctrl-c). The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The value taken from sensor in the unit supplied or mW if no unit is specified.

Any errors are printed to stderr.

## Notes

Please note, that this is all very experimental and the connections are not very stable and crashes are quite common.
Normally it is enough to restart the bluetooth demon and rerun the rfcomm command. The powerspy also sometimes gets
into a non responsive state and needs rebooting.

As the powerspy connects over bluetooth there can be quite a delay in package delivery. Especially if there is something
close that might interfere with the connection. So we don't take the time the package was actually received but the time
we assume the package was sent. We can do this as we tell the powerspy when to end the sampling and send the package
through the `period` parameter.

When developing we tried to use the feature to record measurements to the internal storage of the powerspy.
Unfortunately this was very error prone and put the device in an unresponsive state once in a while. So we opted
for using the streaming feature which gives us the timing issues but at least doesn't crash the powerspy.
