---
title: "Memory Used - procfs - system"
description: "Documentation of MemoryUsedProcfsSystemProvider for the Green Metrics Tool"
date: 2026-07-16T08:49:15+00:00
draft: false
images: []
weight: 182
---

### What it does

This metric provider measures the memory currently in use on the whole system by reading
`/proc/meminfo`.

It is the system-wide counterpart to the
[Memory Used cgroup container provider]({{< relref "memory-used-cgroup-container" >}}) and is
deliberately calculated in a way that is comparable to it.

### Classname

- `MemoryUsedProcfsSystemProvider`

### Metric Name

- `memory_used_procfs_system`

### Unit

- `Bytes`

### Configuration

The provider lives in the `linux` architecture section of the `config.yml`:

```yaml
measurement:
  metric_providers:
    linux:
      memory_used_procfs_system:
        sampling_rate: 99
```

Config keys:

- `sampling_rate` — the interval in milliseconds. Passed to the binary as `-i`.

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- args
    - `-i` / `--interval`: interval in milliseconds
    - `-c` / `--check`: check/test mode — verifies that `/proc/meminfo` can be opened and exits
    - `-h` / `--help`: prints usage and exits

By default the measurement interval is 1000 ms.

```bash
./metric-provider-binary -i 100
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The memory in use in *Bytes*

Any errors are printed to Stderr.

### How it works

The provider is a compiled C binary that parses `/proc/meminfo` on every interval and sums four
fields:

- `Active` — contains anon and file, equivalent to what the cgroup provider sees
- `SUnreclaim` — slab memory that cannot be reclaimed
- `Percpu` — per-CPU allocator memory
- `Unevictable` — memory that cannot be swapped out

The values in `/proc/meminfo` are in kiB, so the total is multiplied by 1024 to arrive at Bytes.

The selection mirrors the cgroup memory provider with one deliberate difference: `shmem` is **not**
subtracted here. On the level of the whole operating system we do want to account for shared
memory, whereas inside a cgroup it would be double-counted. Inactive memory needs no subtraction,
as it is not part of the summed fields to begin with.

If any of the four fields cannot be found in `/proc/meminfo` the binary aborts with an error rather
than reporting a partial total. An integer overflow while summing also aborts the binary.

Unlike the MSR-based providers, this binary needs no special privileges — `/proc/meminfo` is
world-readable — and is therefore not installed setuid.

### Caveats

- This is a system-wide value. It includes the operating system and every other process on the
  machine, not just the measured workload. For attributing memory to your containers use the
  [Memory Used cgroup container provider]({{< relref "memory-used-cgroup-container" >}}).
- "Memory used" has no single correct definition on Linux. This provider implements one specific
  sum (see above). Do not expect it to match `free`, `htop` or `MemAvailable`, which each make
  different choices about caches and reclaimable memory.
- The value is a gauge, not a counter. It is the amount in use at the sampling instant, so
  allocations and frees that happen entirely between two samples are invisible.

### Troubleshooting

- **`Error - Could not open /proc/meminfo for reading`** — `/proc` is not mounted or is not
  accessible. This is also what the `-c` check mode reports as `Couldn't open /proc/meminfo`.
- **`Could not match active`** / **`Could not match slab_unreclaimable`** / **`Could not match percpu`**
  / **`Could not match unevictable`** — the expected field was not present in `/proc/meminfo`. This
  can happen on kernels that do not export all of these fields.
- **`Integer overflow in adding memory`** — the summed value exceeded the range of the accumulator.
