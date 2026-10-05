---
title: "CPU Energy - RAPL - Scaphandre - Component"
description: "Documentation for CpuEnergyRaplScaphandreComponentProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 111
---

### What it does

This metric provider measures CPU energy on **Windows** by reading the RAPL (Running Average Power Limit) energy counters of the CPU. The counters live in machine specific registers (MSR). The provider does not access them directly. It talks to the `ScaphandreDrv` kernel driver from the [hubblo-org windows-rapl-driver](https://github.com/hubblo-org/windows-rapl-driver/) project, which reads the MSRs on its behalf.

It is the Windows counterpart of the Linux [CPU Energy RAPL MSR provider]({{< relref "cpu-energy-RAPL-MSR-component" >}}). Unlike the Linux provider it can report several RAPL domains at once.

### Classname

- `CpuEnergyRaplScaphandreComponentProvider`

### Metric Name

- `cpu_energy_rapl_msr_component`

The provider reports under the same metric name as the Linux RAPL MSR provider. The individual RAPL domains are distinguished by the `detail_name` (see [Output](#output)).

### Unit

- `uJ`

### Platform

Windows only. The provider is configured in the `windows` section of the `config.yml`, which GMT only reads when it runs natively on Windows.

### Prerequisites & Installation

1. The `ScaphandreDrv` kernel driver must be installed and running. The provider binary opens the device `\\.\ScaphandreDriver` that this driver exposes. Please follow [Installation on Windows (native) →]({{< relref "/docs/installation/installation-windows_native.md" >}}) to install and start the driver.
2. The binary `metric-provider-binary.exe` must exist in `metric_providers/cpu/energy/rapl/scaphandre/component/`. The installer `install_windows.ps1` compiles it with the MSVC compiler `cl.exe`. If the installer could not find the compiler, open an "x64 Native Tools Command Prompt for VS 2026" and run `build.bat` in that folder.

The provider is configured in the `config.yml`. It is already enabled in the `windows` section of the `config.yml.example`:

```yml
measurement:
  metric_providers:
    windows:
      cpu_energy_rapl_scaphandre_component:
        sampling_rate: 99
        # Optionally disable individual RAPL domains (cpu_package, cpu_cores, cpu_gpu, dram, psys)
        # domains:
        #   cpu_gpu: False
        #   dram: False
```

### Input Parameters

Configuration in the `config.yml`:

- `sampling_rate`: Interval between two measurements in milliseconds. This parameter is required.
- `domains`: Optional map of RAPL domain names to booleans. A domain set to `False` is not measured. Valid names are `cpu_package`, `cpu_cores`, `cpu_gpu`, `dram` and `psys`. Any other name makes GMT refuse to start the provider with the error `Unknown RAPL domain '<name>'`. Setting a domain to `True` has no effect, as all domains are enabled by default.

Arguments of the binary:

- `-i`: interval in milliseconds (default: 99)
- `-x`: comma separated list of domains to exclude, for example `cpu_gpu,dram`. GMT passes the domains you set to `False` with this switch.
- `-d`: measure only this single domain and skip the auto detection. GMT does not use this switch.
- `-c`: check mode. Opens the driver, reads the RAPL power unit register and exits with `0` on success.

```powershell
.\metric-provider-binary.exe -i 99 -x cpu_gpu,dram
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING DOMAIN`

Where:

- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The energy used by the domain since the previous sample, in micro Joules
- `DOMAIN`: One of `cpu_package`, `cpu_cores`, `cpu_gpu`, `dram` or `psys`. This becomes the `detail_name` of the metric.

Example output:

```txt
1774007770584099 3614000 cpu_package
```

Any errors are printed to Stderr.

### How it works

The binary reads these registers through the driver:

| Domain        | RAPL domain           | MSR     |
| ------------- | --------------------- | ------- |
| `cpu_package` | Package (PKG)         | `0x611` |
| `cpu_cores`   | Power plane 0 (PP0)   | `0x639` |
| `cpu_gpu`     | Power plane 1 (PP1)   | `0x641` |
| `dram`        | DRAM                  | `0x619` |
| `psys`        | Platform (PSYS)       | `0x64D` |

On startup the binary reads the energy unit from the RAPL power unit register (`0x606`). If that read fails it tries the AMD power unit register (`0xC0010299`) instead.

It then checks whether the `dram`, `cpu_gpu` and `psys` domains are active. For each of these it takes one sample over 100 ms. If the counter moved by 1 uJ or less, the domain is dropped for the rest of the run. The `cpu_package` and `cpu_cores` domains are never dropped by this auto detection.

In every interval the binary reads all enabled domains and computes the difference to the previous reading. The 32 bit counter overflow is handled. Each domain gets its own timestamp, which keeps the timestamps unique. Negative values are skipped. The `cpu_gpu` domain always reports at least 2 uJ, so that an idle GPU does not trigger the resolution underflow check of GMT.

The `cpu_package` register also serves as the health check for the driver. If reading it fails, the binary writes a warning to Stderr. After 5 consecutive failures it gives up and exits with code `2`. If you excluded `cpu_package` via `domains`, the register is still read internally for this purpose but not printed.

For timing the binary uses the Windows `QueryPerformanceCounter` together with the wall clock time taken at startup. It raises the Windows timer resolution to 1 ms and sleeps only the remaining time until the next deadline, so that the measurement itself does not add to the interval.

In the phase statistics GMT stores the total energy per domain and derives the mean power as `cpu_power_rapl_msr_component` in mW. If a carbon intensity provider is configured, GMT also derives `cpu_carbon_rapl_msr_component` in ugCO2e.

### Caveats

- All registers are read on CPU 0. On machines with more than one CPU package only the first package is measured.
- The energy counters are always read from the Intel register addresses listed above. The source code defines the AMD energy status registers, but does not read them. Only the power unit register has an AMD fallback.
- The `dram` and `psys` domains are stored under the CPU metric name `cpu_energy_rapl_msr_component`. On Linux, DRAM energy has its own metric `memory_energy_rapl_msr_component`. Keep this in mind when you compare runs across platforms.
- Do not add up the domains. As described for the [Linux RAPL provider]({{< relref "cpu-energy-RAPL-MSR-component" >}}), the package domain already contains the cores and the GPU power planes.
- GMT rejects the data of any `uJ` provider in which a value is 1 uJ or lower. Apart from `cpu_gpu`, the domains have no protection against this. If a run fails with *"is running into a resolution underflow"*, disable the affected domain via `domains`.
- Any output on Stderr is reported as an error when GMT stops the metric providers, and the run fails. This includes the *"Warning: IOCTL read failed"* message of a single failed read.

### Troubleshooting

- *"cpu_energy_rapl_msr_component provider could not be started"* with the hint *"Make sure metric-provider-binary.exe exists in the provider folder and that the ScaphandreDrv driver is installed and running."*: The check mode of the binary failed. In most cases the driver is not running. Start it as described in the [Windows installation guide]({{< relref "/docs/installation/installation-windows_native.md" >}}).
- A `FileNotFoundError` that names `metric-provider-binary.exe`: The binary was not built. Run `build.bat` as described above.
- *"Cannot open driver. Error: ..."*: The binary cannot open `\\.\ScaphandreDriver`. The driver is not loaded.
- *"Fatal: ScaphandreDrv driver lost after 5 consecutive failures"*: The driver disappeared during the measurement. Check it with `sc.exe query ScaphandreDrv` and start it with `sc.exe start ScaphandreDrv`.
