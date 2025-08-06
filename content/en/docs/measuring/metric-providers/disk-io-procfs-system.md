---
title: "Disk IO - procfs - system"
description: "Documentation for DiskIoProcfsSystemProvider of the Green Metrics Tool"
date: 2025-07-07T16:10:00+00:00
weight: 207
---

### What it does

It reads the total amount of sectors read and written from all disk devices on the system by parsing `/proc/diskstats`. This provides system-wide disk I/O statistics.

### Classname

- `DiskIoProcfsSystemProvider`

### Metric Name

- `disk_io_procfs_system`

### Input Parameters

- args
  - `-i`: interval in milliseconds (optional, default: 1000 ms)

Example measuring system disk I/O with an interval of 100 ms:

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP SECTORS_READ SECTORS_WRITTEN DEVICE_NAME`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `SECTORS_READ`: The cumulative number of sectors read from the device since system boot
- `SECTORS_WRITTEN`: The cumulative number of sectors written to the device since system boot
- `DEVICE_NAME`: The name of the disk device (e.g., sda, nvme0n1)

Any errors are printed to Stderr.

### How it works

The provider reads from `/proc/diskstats` which provides kernel-level disk I/O statistics for all block devices on the system.

The provider:

- parses `/proc/diskstats` to extract sectors read and written for each device
- filters out virtual devices that don't represent actual disk I/O:
  - Memory devices (major 1)
  - Floppy disk controllers (major 2)
  - Loopback devices (major 7)
  - SCSI CD-ROM (major 11)
  - ALSA sound devices (major 116)
  - Xen virtual block devices (major 202)
- only counts whole disk devices (minor number divisible by 16), skipping partitions
- outputs statistics for each qualifying disk device

#### Device filtering

The provider filters out virtual and non-disk devices to focus on actual physical disk devices that consume energy. Partition devices (minor number not divisible by 16) are also skipped to avoid double-counting, as the whole disk statistics already include all partition activity.

#### Sectors vs Bytes

The output is in sectors rather than bytes. To convert to bytes, multiply by the sector size (typically 512 bytes for most devices, but can vary). The sector size can be obtained from `/sys/block/<device>/queue/logical_block_size`.

#### System-wide monitoring

Unlike container-specific providers, this metric provider monitors all disk I/O activity on the system, providing a complete picture of disk utilization across all processes and containers.

The values are cumulative since system boot, so calculating actual I/O rates requires taking differences between consecutive measurements.
