---
title: "CPU Frequency - MSR - core"
description: "Documentation of CpuFrequencyMsrCoreProvider for the Green Metrics Tool"
date: 2022-06-01T08:49:15+00:00
draft: false
images: []
weight: 120
---

### What it does

This metric provider measures the actual CPU frequency for every core on **Intel CPUs** by reading
the hardware APERF and MPERF performance counters via the Linux MSR (Model Specific Register) interface.

### Classname

- `CpuFrequencyMsrCoreProvider`

### Metric Name

- `cpu_frequency_msr_core`

### Input Parameters

- args
    - `-i`: interval in milliseconds
    - `-f`: base CPU frequency in GHz (default: 2.4)
    - `-c`: check/test mode — validates that MSR counters are incrementing and then exits

By default the measurement interval is 1000 ms.

```bash
./metric-provider-binary -i 100 -f 2.4
```

Both `sampling_rate` and `base_ghz` can be configured in `config.yml`:

```yaml
cpu_frequency_msr_core:
  sampling_rate: 100
  base_ghz: 3.6  # set to the nominal base clock of your CPU
```

### Output

This metric provider prints to *Stdout* a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING CORE`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The current effective frequency of the core in *Hz*
- `CORE`: The logical CPU index as reported by the kernel

Any errors are printed to Stderr.

### How it works

The provider is a compiled C binary that uses the x86 APERF and MPERF hardware counters to
compute the effective CPU frequency per core.

- **APERF** (Actual Performance register, MSR `0xE8`) increments at the actual clock rate
- **MPERF** (Maximum Performance register, MSR `0xE7`) increments at the base (nominal) clock rate

For each sampling interval the provider reads both counter deltas and derives the effective frequency:

```C
freq_hz = base_ghz * (APERF_delta / MPERF_delta) * 1e9
```

This gives the true average clock speed across the interval, including the effect of turbo boost
and frequency throttling, rather than the OS governor's *requested* frequency.

Core discovery is performed at startup by enumerating
`/sys/devices/system/cpu/cpuX/topology/core_id` entries. The MSRs are then accessed via
`/dev/cpu/<n>/msr`.

Because the binary needs to open `/dev/cpu/*/msr` (which is restricted to root), the compiled
binary is installed with the setuid-root bit set.

### Caveats

- The `-f` base frequency must match the nominal (non-turbo) base clock of the CPU being measured.
  An incorrect value will scale all reported frequencies proportionally.
- If you have very many cores you will generate a lot of data which is tricky to interpret, as
  Linux constantly migrates processes between cores and measurements are not directly comparable
  core-to-core.
- For most users the per-core detail will be noise rather than actionable data. We recommend
  looking at the aggregate or only enabling this provider when debugging frequency-related behaviour.
- This provider only works on **Intel CPUs**. The APERF/MPERF MSRs are Intel-specific and are not
  available on AMD or ARM processors.
- It cannot be used on most VMs or in containers where MSR access is blocked.

### Troubleshooting

The provider requires read access to `/dev/cpu/*/msr`. Common failure modes:

- **`open msr: Permission denied`** — the setuid bit is not set on the binary. Re-run `make` from
  the provider directory (requires sudo).
- **`CPU N no MSR support`** — the `msr` kernel module is not loaded. Run `sudo modprobe msr`.
- **`MSR test failed (no counter progression)`** — the APERF/MPERF counters are not incrementing,
  which typically indicates a VM or container environment that does not expose hardware counters.
- On VMs and many cloud instances MSR access is not available. Use a different frequency provider
  in those environments.
