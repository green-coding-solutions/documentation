---
title: "Disk Used - statvfs - system"
description: "Documentation for DiskUsedStatvfsSystemProvider of the Green Metrics Tool"
date: 2025-07-07T16:15:00+00:00
weight: 208
---

### What it does

It reads the total amount of disk space used on the root filesystem by using the `statvfs()` system call. This provides system-wide disk usage information.

### Classname

- `DiskUsedStatvfsSystemProvider`

### Metric Name

- `disk_used_statvfs_system`

### Input Parameters

- args
  - `-i`: interval in milliseconds (optional, default: 1000 ms)

Example measuring system disk usage with an interval of 100 ms:

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP BYTES_USED`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `BYTES_USED`: The total amount of disk space used on the root filesystem, in bytes

Any errors are printed to Stderr.

### How it works

The provider uses the `statvfs()` system call to query filesystem statistics for the root filesystem (`/`).

The provider:

- calls `statvfs("/", &buf)` to get filesystem statistics
- calculates total space as `f_blocks * f_frsize`
- calculates free space as `f_bfree * f_frsize`
- returns used space as `total_space - free_space`

#### statvfs vs statfs

This provider uses `statvfs()` which is the POSIX-compliant version of filesystem statistics, providing portable access to filesystem information across different Unix-like systems.

#### Free space calculation

The provider uses `f_bfree` (free blocks available to superuser) rather than `f_bavail` (free blocks available to non-privileged users) to calculate free space. This means the "used" calculation includes space reserved for the superuser, providing a more accurate representation of actual disk utilization.

#### Root filesystem monitoring

This provider specifically monitors the root filesystem (`/`) usage. In most systems, this represents the primary disk where the operating system and most applications are installed. If you have separate mount points for different filesystems, this provider will only report usage for the root filesystem.

The measurement represents the current total disk usage and is not cumulative - it's an absolute measurement of how much disk space is currently occupied on the filesystem.
