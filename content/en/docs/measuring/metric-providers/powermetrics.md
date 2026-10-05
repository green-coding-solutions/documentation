---
title: "Powermetrics (macOS)"
description: "Documentation for PowermetricsProvider of the Green Metrics Tool"
date: 2026-10-05T00:00:00+00:00
weight: 144
---

### What it does

This metric provider uses the `powermetrics` tool that ships with **macOS** to read energy and resource data of the Mac. It reports the energy of CPU, GPU and Apple Neural Engine, and the CPU time, disk I/O and energy impact of the Docker Desktop VM.

Apple does not document how `powermetrics` derives its values. The results are therefore not validated. Please read the caveats in [Installation on macOS →]({{< relref "/docs/installation/installation-macos" >}}) before you use them.

### Classname

- `PowermetricsProvider`

### Metric Name

The provider is registered as `powermetrics`, but it does not store a metric with that name. Instead it produces the following metrics, depending on what `powermetrics` reports on your Mac:

| Metric | Unit | detail_name | Source in the powermetrics output |
| ------ | ---- | ----------- | --------------------------------- |
| `cores_energy_powermetrics_component` | `uJ` | `[COMPONENT]` | `processor.cpu_power` |
| `cpu_energy_powermetrics_component` | `uJ` | `[COMPONENT]` | `processor.package_joules` |
| `gpu_energy_powermetrics_component` | `uJ` | `[COMPONENT]` | `processor.gpu_power` |
| `ane_energy_powermetrics_component` | `uJ` | `[COMPONENT]` | `processor.ane_power` |
| `cpu_time_powermetrics_vm` | `ns` | `docker_vm` | `cputime_ns` of the Docker coalition |
| `disk_io_bytesread_powermetrics_vm` | `Bytes` | `docker_vm` | `diskio_bytesread` of the Docker coalition |
| `disk_io_byteswritten_powermetrics_vm` | `Bytes` | `docker_vm` | `diskio_byteswritten` of the Docker coalition |
| `energy_impact_powermetrics_vm` | `*` | `docker_vm` | `energy_impact` of the Docker coalition |

According to the metric descriptions in the frontend, `cores_energy_powermetrics_component` is the energy of the CPU cores of Apple M-Series chips. `cpu_energy_powermetrics_component` is the energy of the CPU package of Intel based Macs.

The energy impact is a proprietary macOS value without a physical unit. GMT stores it with the unit `*`.

### Platform

macOS only. The provider is configured in the `macos` section of the `config.yml`.

### Prerequisites & Installation

`powermetrics` needs root permissions. The install script `install_mac.sh` adds `/etc/sudoers` entries so that the GMT user can run these commands without a password:

- `/usr/bin/powermetrics`
- `/usr/bin/killall powermetrics`
- `/usr/bin/killall -9 powermetrics`

The script also installs the `coreutils` package via Homebrew if `stdbuf` is missing, since GMT starts the provider with `stdbuf`.

The provider is configured in the `config.yml`. It is already enabled in the `macos` section of the `config.yml.example`:

```yml
measurement:
  metric_providers:
    macos:
      powermetrics:
        sampling_rate: 499 # If you set this value too low powermetrics will not be able to accommodate the timing. We recommend no lower than 199 ms
```

Please see [Configuration →]({{< relref "/docs/measuring/configuration" >}}) for further info.

### Input Parameters

- `sampling_rate`: Interval between two samples in milliseconds. We recommend no value lower than 199 ms, as `powermetrics` cannot keep up with the timing otherwise.

GMT starts `powermetrics` with these arguments:

```bash
sudo /usr/bin/powermetrics -i <sampling_rate> --show-process-io --show-process-gpu --show-process-netstats --show-process-energy --show-process-coalition -f plist -b 0
```

The `--show-all` switch is not used on purpose, as it sometimes triggers output on Stderr.

### Output

`powermetrics` writes one plist document per sample to the log file. The documents are separated by NUL bytes. After the run the provider parses all documents and creates the metrics listed above.

Any errors are printed to Stderr. Two kinds of lines on Stderr are known to appear without affecting the measurement and are filtered out. These are lines containing `proc_pid` and lines containing `Second underflow occured`.

### How it works

#### Timestamps

The provider takes the `timestamp` of the first sample as the starting point. For every sample it adds the `elapsed_ns` value reported by `powermetrics` and converts the result to microseconds.

#### Energy

`powermetrics` reports `cpu_power`, `gpu_power` and `ane_power` in mW. The provider multiplies each value with the elapsed time of the sample in ms, which gives the energy in uJ. `package_joules` is already an energy value in Joules and is multiplied by 1,000,000.

#### Docker VM

The provider looks for the coalition named `com.docker.docker` in the sample. If it is found, it stores the CPU time, disk I/O and energy impact of this coalition with the `detail_name` `docker_vm`. If there is no such coalition, these metrics are not created.

#### Phase statistics

For the energy metrics GMT stores the total energy per phase and derives the mean power, for example `cores_power_powermetrics_component` in mW. If a carbon intensity provider is configured, GMT also derives the matching carbon metrics, for example `cores_carbon_powermetrics_component`. For the disk metrics GMT stores the mean rate in `Bytes/s` and the totals as `disk_total_bytesread_powermetrics_vm` and `disk_total_byteswritten_powermetrics_vm`. The CPU time is stored as a total and the energy impact as a mean.

### System check and shutdown

GMT refuses to start the provider if another `powermetrics` process is already running on the system. You can override this check by passing `--dev-no-system-checks` to `runner.py` without a list of check names.

To stop the provider, GMT first sends `SIGIO` and then tries to terminate the process group. Since `powermetrics` runs as root, this usually fails. GMT then calls `sudo /usr/bin/killall powermetrics`. This also stops any other `powermetrics` process on the system, for example one that you started yourself. GMT prints a notice if it detected such a process at startup.

GMT then waits up to 60 seconds for `powermetrics` to flush its data and exit. If it is still running after that, GMT kills it with `killall -9` and fails with the message *"powermetrics had to be killed with kill -9. Values can not be trusted!"*.

### Caveats

- Running GMT on macOS is meant for testing your usage scenarios, not for benchmarking. Docker runs inside a VM on macOS and `powermetrics` is closed source.
- If a run is very short, `powermetrics` might not have written any data yet. In this case the provider has no measurements and GMT reports that the metrics log file was empty.
- See [Troubleshooting →]({{< relref "/docs/help/troubleshooting" >}}) for the known XML parsing error of the `powermetrics` output.
