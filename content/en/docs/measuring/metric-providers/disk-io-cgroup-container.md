---
title: "Disk IO - cgroup - container"
description: "Documentation for DiskIoCgroupContainerProvider of the Green Metrics Tool"
date: 2025-07-07T15:52:00+00:00
weight: 205
---

### What it does

It reads the total amount of read and written bytes from disk devices by the cgroup of the container. More information about cgroups can be found in the [cgroups man page](https://www.man7.org/linux/man-pages/man7/cgroups.7.html).

### Classname

- `DiskIoCgroupContainerProvider`

### Metric Name

- `disk_io_cgroup_container`

### Input Parameters

- args
  - `-s`: container-ids separated by commas
  - `-i`: interval in milliseconds (optional, default: 1000 ms)

Example measuring two containers with an interval of 100 ms:

```bash
./metric-provider-binary -i 100 -s 7f38a4c25fb8f9d5f8651d6ed986b3658dba20d1f5fec98a1f71c141c2b48f4b,c3592e1385d63f9c7810470b12aa00f7d6f7c0e2b9981ac2bdb4371126a0660a
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP RBYTES WBYTES CONTAINER-ID`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `RBYTES`: The cumulative amount of bytes read from disk since container start
- `WBYTES`: The cumulative amount of bytes written to disk since container start
- `CONTAINER-ID`: The container ID that this reading is for

Any errors are printed to Stderr.

### How it works

The provider assumes that you have [cgroups v2](https://www.man7.org/linux/man-pages/man7/cgroups.7.html) enabled on your system.

It reads from the cgroup's `io.stat` file which provides per-device I/O statistics for the container.

The provider:

- parses the `io.stat` file to extract `rbytes` and `wbytes` values
- filters out virtual devices that don't represent actual disk I/O:
  - Memory devices (major 1)
  - Floppy disk controllers (major 2)
  - Loopback devices (major 7)
  - SCSI CD-ROM (major 11)
  - ALSA sound devices (major 116)
  - Xen virtual block devices (major 202)
- only counts whole disk devices (minor number divisible by 16)
- sums up the read and write bytes across all real disk devices

#### Device filtering

The provider filters out virtual and non-disk devices to focus on actual disk I/O operations that consume energy. It checks the major device numbers against a list of known virtual devices and excludes them from the calculations.

If partition devices are encountered (minor number not divisible by 16), the provider will exit with an error as this should not happen in a properly configured container environment.

#### Attribution of disk I/O

The disk I/O is attributed directly to each container based on the cgroup accounting. This provides accurate per-container disk usage without double-counting or attribution issues.

Since containers share the same underlying disk devices, the measurements represent the actual bytes read from and written to the physical storage by each container's processes.
