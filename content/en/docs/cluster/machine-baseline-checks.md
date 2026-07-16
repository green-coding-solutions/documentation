---
title: "Machine Baseline Checks"
description: "Optional hardware and OS checks that GMT verifies before each measurement run"
date: 2026-07-02T00:00:00+00:00
weight: 1005
toc: false
---

GMT can verify a set of hardware and OS properties before every measurement run. Most checks are configured under the `machine:` key in `config.yml`; a few (systemd timers, cron files, kernel watchdogs) need no configuration at all and always run on Linux — see [Unconditional Checks](#unconditional-checks) below.

Every config-driven check is **opt-in**: omitting a key (leaving it unset / `null`) always skips that check, and is now reported as `INFO` (not `OK`), so a `system_check` run makes it obvious which checks are not yet configured on a given machine.

For most keys, explicitly setting `false` also just skips the check, same as leaving it unset. There are two kinds of exceptions:

- `cpu_smt` and `cpu_turbo_boost` are plain booleans by nature: `false` asserts the feature is **off**, `true` asserts it is **on**, and only leaving the key unset (`null`) skips the check.
- `cpu_governor`, `cpu_scaling_driver`, and `docker_registry_url` take a string when you want to match a specific value, but `false` has a special meaning for them — it asserts that the feature must be **absent** altogether (e.g. "no scaling governor is active on any core") rather than skipping the check.

A failed check emits a `WARN` and, depending on `system_check_threshold`, may abort the run.

If you don't yet know the right value for a given key, each section below shows the exact command to read it off the current machine. There is no single script that detects and writes out all of these `machine:` values at once — they describe the fixed identity/capacity of a specific machine (its RAM size, its RAPL wattage caps, its expected CPU governor, etc.) and are meant to be set once, deliberately, per machine. The one place a script *does* auto-prepare values for you is the [Unconditional Checks](#unconditional-checks) below, via the [NOP Linux script →]({{< relref "nop-linux" >}}).

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

Verifies that the RAPL power limits locked on the machine are **exactly equal** to the values you configure. Ensures a consistent thermal envelope across cluster nodes.

```yaml
machine:
  rapl_power_capping:
    package: 35    # Watts — per-socket CPU package limit
    dram: 10       # Watts — DRAM controller limit
    psys: 65       # Watts — platform-wide limit (if available)
```

Each sub-key is independent; omit any you do not want to enforce. The configured Watt value is converted to microwatts and compared for exact equality against **every** limit the domain exposes — both the long-term (`constraint_0`) and the short-term (`constraint_1`) limit, wherever present. This transitively also catches the two limits disagreeing with each other, which is why we recommend setting both to the same value.

Domains are discovered under `/sys/devices/virtual/powercap/intel-rapl/`, including nested ones such as `intel-rapl:0:1` for DRAM. Each domain's `name` file classifies it as `package`, `dram` or `psys`, and its `constraint_N_name` files identify which constraint is the long- and which the short-term limit. Domains that expose only a long-term limit — typical for `dram` and `psys` — are checked on that limit alone.

To read the current limits on your machine:

```sh
for name in /sys/devices/virtual/powercap/intel-rapl/intel-rapl:*/name \
            /sys/devices/virtual/powercap/intel-rapl/intel-rapl:*/*/name; do
    domain=$(dirname "$name")
    echo "$(basename "$domain") ($(cat "$name")):"
    for constraint in "$domain"/constraint_*_name; do
        echo "    $(cat "$constraint") = $(cat "${constraint%_name}_power_limit_uw") uW"
    done
done
```

Also see [Power Saving →]({{< relref "power-saving#power-capping-machines" >}}) for how to make these limits persistent across reboots via a systemd service.

## Docker Registry Mirror

Confirms that the Docker daemon's registry mirror configuration matches what you expect.

```yaml
machine:
  docker_registry_url: "https://registry.example.com"
```

The check runs `docker info` and looks for the URL in the `Registry Mirrors` section.

Set `docker_registry_url: false` to instead assert that **no** registry mirror is configured at all — the check then fails if a `Registry Mirrors:` section is present in `docker info` output.

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

Set `cpu_governor: false` to instead assert that **no** core exposes a `scaling_governor` file at all (i.e. cpufreq is not active/available on this machine).

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

Reads `/sys/devices/system/cpu/cpu*/cpufreq/scaling_driver`. A different driver can apply different power and frequency policies even when the governor setting appears identical.

Set `cpu_scaling_driver: false` to instead assert that **no** core exposes a `scaling_driver` file at all.

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

## Unconditional Checks

The following three checks need **no** `config.yml` entry at all — they always run on Linux (they are skipped, returning `None`/`OK`, on macOS and Windows) and simply verify that nothing on the machine can silently interrupt or bias a measurement.

The [NOP Linux script →]({{< relref "nop-linux" >}}) auto-prepares a machine so that all three of these pass: it disables/masks system and user `systemd` timers, deletes all cron files, and zeroes out the kernel watchdog sysctls, in addition to disabling NTP and removing swap-adjacent packages. Run it once on a fresh cluster machine instead of doing the steps below by hand.

### Systemd Timers

Warns when any active `systemd` timer is detected. Both scopes are checked: system-wide timers (read via the root helper) and timers in the invoking user's own `systemd` scope. Timers can wake the system and create measurement noise. To inspect active timers:

```sh
sudo systemctl --all list-timers    # system-wide scope
systemctl --user --all list-timers  # user scope
```

### Cron Files

Runs as root and warns when any cron file is found under `/var/spool/cron` or `/etc/cron*`. To inspect and remove them:

```sh
ls -la /etc/cron* /var/spool/cron* 2>/dev/null
sudo rm -fR /etc/cron* /var/spool/cron*
```

### Kernel Watchdog

Warns when the kernel's hard/soft lockup watchdog is active (any of `kernel.watchdog`, `kernel.nmi_watchdog`, or `kernel.soft_watchdog` reads non-zero). These watchdogs periodically fire NMIs/interrupts to detect a hung kernel, which can add noise to measurements.

To check the current values:

```sh
sysctl kernel.watchdog kernel.nmi_watchdog kernel.soft_watchdog
```

To disable them immediately (until the next reboot):

```sh
sudo sysctl -w kernel.watchdog=0 kernel.nmi_watchdog=0 kernel.soft_watchdog=0
```

To make this persist across reboots, drop a file in `/etc/sysctl.d/` and apply it:

```sh
cat <<'EOF' | sudo tee /etc/sysctl.d/99-gmt-watchdog.conf
kernel.watchdog = 0
kernel.nmi_watchdog = 0
kernel.soft_watchdog = 0
EOF
sudo sysctl --system
```

---

## All checks at a glance

Leaving a config-driven key unset (or `null`) always reports `INFO` — not `OK` — so it's visible at a glance which checks aren't configured yet. Checks marked "assert absence" in the last column treat `false` specially: instead of skipping, they require the feature to be completely absent from the machine.

| Config key | Unset behaviour | Severity | `false` behaviour |
|---|---|---|---|
| `base_temperature_{chip,feature,value}` | `INFO` (skipped) | WARN (blocks run until stable) | skipped |
| `rapl_power_capping.package` | `INFO` (skipped) | WARN | skipped |
| `rapl_power_capping.dram` | `INFO` (skipped) | WARN | skipped |
| `rapl_power_capping.psys` | `INFO` (skipped) | WARN | skipped |
| `docker_registry_url` | `INFO` (skipped) | WARN | assert absence |
| `cpu_cores` | `INFO` (skipped) | WARN | skipped |
| `dram_gb` | `INFO` (skipped) | WARN | skipped |
| `usb_devices` | `INFO` (skipped) | WARN | skipped |
| `pci_devices` | `INFO` (skipped) | WARN | skipped |
| `cpu_governor` | `INFO` (skipped) | WARN | assert absence |
| `cpu_frequency_mhz` | `INFO` (skipped) | WARN | skipped |
| `cpu_scaling_driver` | `INFO` (skipped) | WARN | assert absence |
| `cpu_smt` | `INFO` (skipped) | WARN | asserts SMT is off |
| `cpu_turbo_boost` | `INFO` (skipped) | WARN | asserts boost is off |

| Unconditional check (no config key, always on for Linux) | Severity |
|---|---|
| systemd timers | WARN |
| cron files | WARN |
| kernel watchdog | WARN |

## Auto-Dump template script

If you want to get a quick template of the current settings you can run this `bash` script (tested only on Ubuntu):

```bash
echo "  cpu_cores: $(nproc)"
echo "  cpu_frequency_mhz: $(grep -m1 MHz /proc/cpuinfo | awk -F: '{printf "%.0f", $2}')"
echo -e "  rapl_power_capping:\n    package: $(echo "scale=2; $(cat /sys/devices/virtual/powercap/intel-rapl/intel-rapl\:0/constraint_0_power_limit_uw) / 1000000" | bc)"
echo "  dram_gb: $(lsmem | awk '/Total online memory:/{print $NF}' | tr -d 'GiB')"
echo "  cpu_smt: false"
echo "  cpu_turbo_boost: false"
echo "  cpu_governor: $(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null || echo "false")"
echo "  cpu_scaling_driver: $(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_driver 2>/dev/null || echo "false")"
echo "  docker_registry_url: http://192.168.30.10:5000/"
echo "  usb_devices:"
lsusb | awk '{print "    - " $6}'
echo "  pci_devices:"
lspci | awk -F': ' '{print "    - \"" $2 "\""}'
```
