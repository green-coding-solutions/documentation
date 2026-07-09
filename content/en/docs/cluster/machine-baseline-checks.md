---
title: "Machine Baseline Checks"
description: "Optional hardware and OS checks that GMT verifies before each measurement run"
date: 2026-07-02T00:00:00+00:00
weight: 1005
toc: false
---

GMT can verify a set of hardware and OS properties before every measurement run. All checks are configured under the `machine:` key in `config.yml`.

Every check is **opt-in**: omitting a key (or setting it to `null` / `False`) silently skips that check. A failed check emits a `WARN` and, depending on `system_check_threshold`, may abort the run.

## Temperature

GMT reads the current temperature from a hardware sensor chip and compares it against a configured baseline. If the machine is outside the expected range the run is held until the temperature stabilises.

```yaml
machine:
  base_temperature_chip: "acpitz-acpi-0"   # sensor chip name (from `sensors`)
  base_temperature_feature: "temp1"         # feature name on that chip
  base_temperature_value: 65               # maximum acceptable °C
```

| Condition | Behaviour |
|---|---|
| `current > base_temperature_value` | `cooldown` status event; client sleeps 60 s and retries |
| `current ≤ base_temperature_value − 10` | `warmup` status event; client spins all CPU cores for 5 min then retries |
| More than 10 consecutive failures | Fatal error; cluster process exits |

The current temperature is always written to `machines.current_temperature` in the database. Status events (`cooldown`, `warmup`) include the exact temperature reading in their `data` column.

To find the right chip and feature names:

```sh
sensors
# or for JSON output:
sensors -j
```

Also see [Accuracy Control →]({{< relref "accuracy-control" >}}).

## RAPL Power Capping

Verifies that RAPL power limits are at or below the values you have locked on the machine. Ensures a consistent thermal envelope across cluster nodes.

```yaml
machine:
  rapl_power_capping:
    package: 35    # Watts — per-socket CPU package limit
    dram: 10       # Watts — DRAM controller limit
    psys: 65       # Watts — platform-wide limit (if available)
```

Each sub-key is independent; omit any you do not want to enforce. Values are compared against the `constraint_0_power_limit_uw` sysfs files under `/sys/devices/virtual/powercap/intel-rapl/`.

To read the current limits on your machine:

```sh
cat /sys/devices/virtual/powercap/intel-rapl/intel-rapl:*/constraint_0_power_limit_uw
```

Also see [NOP Linux →]({{< relref "nop-linux" >}}) for how to make these limits persistent across reboots.

## Docker Registry Mirror

Confirms that the Docker daemon is configured to use a specific registry mirror (e.g. a local cache).

```yaml
machine:
  docker_registry_url: "https://registry.example.com"
```

The check runs `docker info` and looks for the URL in the `Registry Mirrors` section.
Also see [Container Registry →]({{< relref "container-registry" >}}).

## CPU Core Count

Verifies the total number of logical CPUs (threads, including SMT/HT siblings).

```yaml
machine:
  cpu_cores: 16
```

Detects hot-plug events or unexpected changes in Hyper-Threading state. If `cpu_smt` is also configured, the two checks complement each other.

## Installed RAM

Verifies total installed RAM in whole gigabytes.

```yaml
machine:
  dram_gb: 64
```

Detects failed or removed DIMMs.

## USB Device Allowlist

Warns when any connected USB device is **not** present in the allowlist. Each entry is matched as a substring against `lsusb` output lines.

```yaml
machine:
  usb_devices:
    - "8087:0026"          # Intel USB hub
    - "046d:c52b"          # Logitech Unifying Receiver
    - "Linux Foundation"   # internal root hubs
```

Run `lsusb` on your machine to collect the expected entries. The check is skipped on macOS and Windows.

## PCI Device Allowlist

Warns when any connected PCI device is **not** present in the allowlist. Each entry is matched as a substring against `lspci` output lines.

```yaml
machine:
  pci_devices:
    - "Network controller"
    - "SATA controller"
    - "VGA compatible controller"
```

Run `lspci` on your machine to collect the expected entries. The check is skipped on macOS and Windows.

## CPU Scaling Governor

Verifies that **all** CPU cores use the expected frequency scaling governor. Governor changes after a reboot are one of the most common silent causes of measurement variance.

```yaml
machine:
  cpu_governor: "performance"
```

Reads `/sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`. To lock the governor:

```sh
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
# or
sudo cpupower frequency-set -g performance
```

Also see [NOP Linux →]({{< relref "nop-linux" >}}).

## CPU Frequency

Verifies that the current frequency of **every** CPU core is within ±10 MHz of the configured value. Useful when frequency scaling is fully locked (e.g. `intel_pstate` with min = max).

```yaml
machine:
  cpu_frequency_mhz: 3000
```

## CPU Scaling Driver

Verifies that the cpufreq scaling driver matches the expected value on all cores.

```yaml
machine:
  cpu_scaling_driver: "intel_pstate"   # or "acpi-cpufreq", "cppc_cpufreq", etc.
```

A different driver can apply different power and frequency policies even when the governor setting appears identical.

## SMT / Hyper-Threading

Verifies whether Simultaneous Multi-Threading (Intel HT / AMD SMT) is enabled or disabled.

```yaml
machine:
  cpu_smt: false   # true = SMT must be enabled, false = SMT must be disabled
```

Reads `/sys/devices/system/cpu/smt/active`. To disable SMT:

```sh
echo off | sudo tee /sys/devices/system/cpu/smt/control
# For a permanent change add "nosmt" to GRUB_CMDLINE_LINUX in /etc/default/grub
```

## CPU Turbo Boost

Verifies whether CPU frequency boost (Intel Turbo Boost / AMD Boost) is enabled or disabled.

```yaml
machine:
  cpu_turbo_boost: false   # true = boost must be on, false = boost must be off
```

To disable Turbo Boost (Intel):

```sh
echo 1 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo
```

## System-wide Systemd Timers

This check runs as root and warns when any active system-wide `systemd` timer is detected. Timers can wake the system and create measurement noise.

This check is not configured via `config.yml` — it always runs on Linux. To inspect active timers:

```sh
systemctl --all list-timers
```

Also see [NOP Linux →]({{< relref "nop-linux" >}}) for a full list of services and timers to disable on cluster machines.

---

## All checks at a glance

| Config key | Default | Severity |
|---|---|---|
| `base_temperature_{chip,feature,value}` | `False` (skipped) | WARN (blocks run until stable) |
| `rapl_power_capping.package` | `null` (skipped) | WARN |
| `rapl_power_capping.dram` | `null` (skipped) | WARN |
| `rapl_power_capping.psys` | `null` (skipped) | WARN |
| `docker_registry_url` | `null` (skipped) | WARN |
| `cpu_cores` | `null` (skipped) | WARN |
| `dram_gb` | `null` (skipped) | WARN |
| `usb_devices` | absent (skipped) | WARN |
| `pci_devices` | absent (skipped) | WARN |
| `cpu_governor` | `null` (skipped) | WARN |
| `cpu_frequency_mhz` | `null` (skipped) | WARN |
| `cpu_scaling_driver` | `null` (skipped) | WARN |
| `cpu_smt` | `null` (skipped) | WARN |
| `cpu_turbo_boost` | `null` (skipped) | WARN |
| systemd timers (root, always on) | — | WARN |
