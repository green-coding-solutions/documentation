---
title: "Overhead of Measurement Providers"
description: "How much CPU % and energy does the metric providers itself draw"
lead: ""
date: 2022-08-04T08:49:15+00:00
weight: 999
---

The Green Metrics Tools measurement providers run on the same system as the software
to be measured.

This allows for easiness of testing, but poses the risk of skewing the measured
results.

The reporters are designed to have negligible impact on their own.

## Measure provider overhead

Please use our script called [calibrate.py](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/tools/calibrate.py) to get the provider overhead.

It will use the configured *metric providers* from your `config.yml` and then calculate the overhead.

The script produces a lot of output, but what you want to look out for is:

- System Baseline measurement successful
    - **Mean Power**: This is your baseline power. This means the power of the system with only one energy metrics provider attached
- System Idle measurement successful (second time)
    - **Mean Power**: This is your idle power. This means the power of the system with all configured metric providers attached
    - **Idle Energy overhead (rel.)**: This is the realtive overhead to the baseline energy. This value helps quantifying the reporters in low power systems and is rather a general debug info
    - **Idle Power overhead**: This is the power in Watts that your providers draw additionally.
- Provider effective energy overhead measurement successful
    - **Peak system power**: This is what your system is drawing when fully loaded
    - **Effective energy overhead (rel.)**: This is the most important value. It tells you how much relative amount of power the metric providers use when the system is loaded. The share is calculated on the difference between *max power* and *baseline power*. So the effective dynamic range of the system.


## Results for Esprimo P956 - Measurement #1 Machine Power

Configured reporters
- PsuEnergyAcMCPMachineProvider: 99 ms sampling_rate
- NetworkIoCgroupContainerProvider: 99 ms sampling_rate
- CpuEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- MemoryEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- CpuUtilizationProcfsSystemProvider: 99 ms sampling_rate
- MemoryTotalCgroupContainerProvider: 99 ms sampling_rate
- CpuUtilizationCgroupContainerProvider: 99 ms sampling_rate
- LmsensorsTemperatureComponentProvider: 99 ms sampling_rate

```console
[INFO] 2024-02-16 10:56:49,208 - System Baseline measurement successful
[INFO] 2024-02-16 10:56:49,209 - Mean Energy: 27045.41 mJ
[INFO] 2024-02-16 10:56:49,209 - Mean Power: 13.52 W
[INFO] 2024-02-16 10:56:49,209 - Std. Dev: 7940.69 mJ
[INFO] 2024-02-16 10:56:49,210 - Std. Dev (rel): 29.36 %
[INFO] 2024-02-16 10:56:49,210 - ----------------------------------------------------------
[INFO] 2024-02-16 11:04:31,450 - System Idle measurement successful
[INFO] 2024-02-16 11:04:31,450 - Mean Energy: 26872.84 mJ
[INFO] 2024-02-16 11:04:31,450 - Mean Power: 13.44 W
[INFO] 2024-02-16 11:04:31,451 - Std. Dev: 7791.9 mJ
[INFO] 2024-02-16 11:04:31,451 - Std. Dev (rel): 29.0 %
[INFO] 2024-02-16 11:04:31,451 - ----------------------------------------------------------
[INFO] 2024-02-16 11:04:31,451 - Provider idle energy overhead measurement successful.
[INFO] 2024-02-16 11:04:31,451 - Idle Energy overhead is: -172.56756756757022 mJ
[INFO] 2024-02-16 11:04:31,451 - Idle Energy overhead (rel.): -0.6380661150417813 %
[INFO] 2024-02-16 11:04:31,452 - Idle Power overhead is: -0.08628378378378511 W
[INFO] 2024-02-16 11:04:31,452 - -----------------------------------------------------------------------------------------
[INFO] 2024-02-16 12:00:18,430 - System Load measurement successful
[INFO] 2024-02-16 12:00:18,430 - Mean Energy: 123655.17 mJ
[INFO] 2024-02-16 12:00:18,430 - Mean Power: 61.83 W
[INFO] 2024-02-16 12:00:18,430 - Std. Dev: 1795.79 mJ
[INFO] 2024-02-16 12:00:18,431 - Std. Dev (rel): 1.45 %
[INFO] 2024-02-16 12:00:18,431 - ----------------------------------------------------------
[INFO] 2024-02-16 12:00:18,431 - Provider effective energy overhead measurement successful.
[INFO] 2024-02-16 12:00:18,431 - Peak system energy is: 123655.1724137931 mJ
[INFO] 2024-02-16 12:00:18,431 - Peak system power is: 61.82758620689655 W
[INFO] 2024-02-16 12:00:18,431 - Effective energy overhead (rel.) is: -0.17862331409265053 %
[INFO] 2024-02-16 12:00:18,431 - -----------------------------------------------------------------------------------------
```

#### Summary:
- Used reporter for Machine energy was [MCP]({{< relref "/docs/measuring/metric-providers/psu-energy-ac-mcp-machine" >}})
- Effective total machine energy overhead in a loaded system is **-0.17 %**
- Idle total machine energy overhead in an idle system is **-0.63 %**
- Machine power overhead is **-0.08 W**

Both values are extremely low and the negative value shows even that we cannot even measure it probably.
The nature of a switching power supply is that the machine power, when polled in shot intervals, tends to jump quite a bit. for machines that are strongly optimized for low power, like the Esprimo P956, the values can be as asburdly large as you see here. Thus statistically we cannot conclude that our overhead is really lower than ~29% as this is the StdDev. However the average value is usually what you work with in switching power supplies and it is fair to assume that the overhead is extremely low and most likely < 1%.

Read on for the CPU only values, which give some more insights, but are less general.


## Results for Esprimo P956 - Measurement #2 CPU Energy

Configured reporters
- NetworkIoCgroupContainerProvider: 99 ms sampling_rate
- CpuEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- MemoryEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- CpuUtilizationProcfsSystemProvider: 99 ms sampling_rate
- MemoryTotalCgroupContainerProvider: 99 ms sampling_rate
- CpuUtilizationCgroupContainerProvider: 99 ms sampling_rate
- LmsensorsTemperatureComponentProvider: 99 ms sampling_rate

```console
[INFO] 2024-02-16 12:08:32,652 - System Baseline measurement successful
[INFO] 2024-02-16 12:08:32,652 - Mean Energy: 410.66 mJ
[INFO] 2024-02-16 12:08:32,653 - Mean Power: 0.21 W
[INFO] 2024-02-16 12:08:32,653 - Std. Dev: 20.76 mJ
[INFO] 2024-02-16 12:08:32,653 - Std. Dev (rel): 5.05 %
[INFO] 2024-02-16 12:08:32,653 - ----------------------------------------------------------
[INFO] 2024-02-16 12:19:28,807 - System Idle measurement successful
[INFO] 2024-02-16 12:19:28,807 - Mean Energy: 931.07 mJ
[INFO] 2024-02-16 12:19:28,807 - Mean Power: 0.47 W
[INFO] 2024-02-16 12:19:28,807 - Std. Dev: 53.73 mJ
[INFO] 2024-02-16 12:19:28,808 - Std. Dev (rel): 5.77 %
[INFO] 2024-02-16 12:19:28,808 - ----------------------------------------------------------
[INFO] 2024-02-16 12:19:28,808 - Provider idle energy overhead measurement successful.
[INFO] 2024-02-16 12:19:28,808 - Idle Energy overhead is: 520.4121621621622 mJ
[INFO] 2024-02-16 12:19:28,808 - Idle Energy overhead (rel.): 126.72513080390931 %
[INFO] 2024-02-16 12:19:28,808 - Idle Power overhead is: 0.2602060810810811 W
[INFO] 2024-02-16 12:19:28,808 - -----------------------------------------------------------------------------------------
[INFO] 2024-02-16 13:02:54,984 - System Load measurement successful
[INFO] 2024-02-16 13:02:54,985 - Mean Energy: 80555.66 mJ
[INFO] 2024-02-16 13:02:54,985 - Mean Power: 40.28 W
[INFO] 2024-02-16 13:02:54,985 - Std. Dev: 706.44 mJ
[INFO] 2024-02-16 13:02:54,985 - Std. Dev (rel): 0.88 %
[INFO] 2024-02-16 13:02:54,985 - ----------------------------------------------------------
[INFO] 2024-02-16 13:02:54,985 - Provider effective energy overhead measurement successful.
[INFO] 2024-02-16 13:02:54,985 - Peak system energy is: 80555.6551724138 mJ
[INFO] 2024-02-16 13:02:54,985 - Peak system power is: 40.2778275862069 W
[INFO] 2024-02-16 13:02:54,985 - Effective energy overhead (rel.) is: 0.6493383337067538 %
[INFO] 2024-02-16 13:02:54,985 - -----------------------------------------------------------------------------------------
```

#### Summary:
- Used reporter for CPU energy was [MCP]({{< relref "/docs/measuring/metric-providers/cpu-energy-RAPL-MSR-component" >}})
- Effective CPU energy overhead in a loaded system is **0.65 %**
- Idle CPU energy overhead in an idle system is **126 %**
    - As stated before, use this value only for debugging in low power systems
- CPU power overhead is **0.26 W**

## Fujitsu TX1330 M2 - Measurement #1 Machine Power

Configured reporters
- PsuEnergyAcMCPMachineProvider: 99 ms sampling_rate
- NetworkIoCgroupContainerProvider: 99 ms sampling_rate
- CpuEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- MemoryEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- CpuUtilizationProcfsSystemProvider: 99 ms sampling_rate
- MemoryTotalCgroupContainerProvider: 99 ms sampling_rate
- CpuUtilizationCgroupContainerProvider: 99 ms sampling_rate
- LmsensorsTemperatureComponentProvider: 99 ms sampling_rate

```console
[INFO] 2024-02-16 10:13:26,496 - System Baseline measurement successful
[INFO] 2024-02-16 10:13:26,496 - Mean Energy: 31638.38 mJ
[INFO] 2024-02-16 10:13:26,496 - Mean Power: 15.82 W
[INFO] 2024-02-16 10:13:26,496 - Std. Dev: 905.53 mJ
[INFO] 2024-02-16 10:13:26,496 - Std. Dev (rel): 2.86 %
[INFO] 2024-02-16 10:13:26,497 - ----------------------------------------------------------
[INFO] 2024-02-16 10:19:03,554 - System Idle measurement successful
[INFO] 2024-02-16 10:19:03,554 - Mean Energy: 31924.73 mJ
[INFO] 2024-02-16 10:19:03,554 - Mean Power: 15.96 W
[INFO] 2024-02-16 10:19:03,554 - Std. Dev: 1148.07 mJ
[INFO] 2024-02-16 10:19:03,555 - Std. Dev (rel): 3.6 %
[INFO] 2024-02-16 10:19:03,555 - ----------------------------------------------------------
[INFO] 2024-02-16 10:19:03,555 - Provider idle energy overhead measurement successful.
[INFO] 2024-02-16 10:19:03,555 - Idle Energy overhead is: 286.3513513513499 mJ
[INFO] 2024-02-16 10:19:03,555 - Idle Energy overhead (rel.): 0.9050759426628576 %
[INFO] 2024-02-16 10:19:03,555 - Idle Power overhead is: 0.14317567567567493 W
[INFO] 2024-02-16 10:19:03,555 - -----------------------------------------------------------------------------------------
[INFO] 2024-02-16 10:39:58,502 - System Load measurement successful
[INFO] 2024-02-16 10:39:58,502 - Mean Energy: 90647.59 mJ
[INFO] 2024-02-16 10:39:58,502 - Mean Power: 45.32 W
[INFO] 2024-02-16 10:39:58,503 - Std. Dev: 7196.52 mJ
[INFO] 2024-02-16 10:39:58,503 - Std. Dev (rel): 7.94 %
[INFO] 2024-02-16 10:39:58,503 - ----------------------------------------------------------
[INFO] 2024-02-16 10:39:58,503 - Provider effective energy overhead measurement successful.
[INFO] 2024-02-16 10:39:58,503 - Peak system energy is: 90647.58620689655 mJ
[INFO] 2024-02-16 10:39:58,503 - Peak system power is: 45.323793103448274 W
[INFO] 2024-02-16 10:39:58,504 - Effective energy overhead (rel.) is: 0.48526554056358817 %
```

#### Summary:
- Used reporter for Machine energy was [MCP]({{< relref "/docs/measuring/metric-providers/psu-energy-ac-mcp-machine" >}})
- Effective total machine energy overhead in a loaded system is **0.4 %**
- Idle total machine energy overhead in an idle system is **0.9 %**
- Machine power overhead is **0.14 W**

The nature of a switching power supply is that the machine power, when polled in shot intervals, tends to jump quite a bit. Thus statistically we cannot conclude that our overhead is really lower than ~3.6% as this is the StdDev. However the average value is usually what you work with in switching power supplies and it is fair to assume that the overhead is extremely low and most likely < 1%.

## Fujitsu TX1330 M2 - Measurement #2 CPU Power

Configured reporters
- NetworkIoCgroupContainerProvider: 99 ms sampling_rate
- CpuEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- MemoryEnergyRaplMsrComponentProvider: 99 ms sampling_rate
- CpuUtilizationProcfsSystemProvider: 99 ms sampling_rate
- MemoryTotalCgroupContainerProvider: 99 ms sampling_rate
- CpuUtilizationCgroupContainerProvider: 99 ms sampling_rate
- LmsensorsTemperatureComponentProvider: 99 ms sampling_rate

```console
[INFO] 2024-02-16 12:26:02,660 - System Baseline measurement successful
[INFO] 2024-02-16 12:26:02,660 - Mean Energy: 326.88 mJ
[INFO] 2024-02-16 12:26:02,661 - Mean Power: 0.16 W
[INFO] 2024-02-16 12:26:02,661 - Std. Dev: 21.74 mJ
[INFO] 2024-02-16 12:26:02,661 - Std. Dev (rel): 6.65 %
[INFO] 2024-02-16 12:26:02,661 - ----------------------------------------------------------
[INFO] 2024-02-16 13:00:24,963 - System Idle measurement successful
[INFO] 2024-02-16 13:00:24,963 - Mean Energy: 827.46 mJ
[INFO] 2024-02-16 13:00:24,964 - Mean Power: 0.41 W
[INFO] 2024-02-16 13:00:24,964 - Std. Dev: 74.56 mJ
[INFO] 2024-02-16 13:00:24,964 - Std. Dev (rel): 9.01 %
[INFO] 2024-02-16 13:00:24,964 - ----------------------------------------------------------
[INFO] 2024-02-16 13:00:24,964 - Provider idle energy overhead measurement successful.
[INFO] 2024-02-16 13:00:24,965 - Idle Energy overhead is: 500.5810810810811 mJ
[INFO] 2024-02-16 13:00:24,965 - Idle Energy overhead (rel.): 153.1398569597751 %
[INFO] 2024-02-16 13:00:24,965 - Idle Power overhead is: 0.25029054054054056 W
[INFO] 2024-02-16 13:00:24,965 - -----------------------------------------------------------------------------------------
[INFO] 2024-02-16 13:18:28,066 - System Load measurement successful
[INFO] 2024-02-16 13:18:28,067 - Mean Energy: 54423.86 mJ
[INFO] 2024-02-16 13:18:28,067 - Mean Power: 27.21 W
[INFO] 2024-02-16 13:18:28,067 - Std. Dev: 6071.03 mJ
[INFO] 2024-02-16 13:18:28,068 - Std. Dev (rel): 11.16 %
[INFO] 2024-02-16 13:18:28,068 - ----------------------------------------------------------
[INFO] 2024-02-16 13:18:28,068 - Provider effective energy overhead measurement successful.
[INFO] 2024-02-16 13:18:28,068 - Peak system energy is: 54423.862068965514 mJ
[INFO] 2024-02-16 13:18:28,068 - Peak system power is: 27.211931034482756 W
[INFO] 2024-02-16 13:18:28,068 - Effective energy overhead (rel.) is: 0.925340096490781 %
[INFO] 2024-02-16 13:18:28,068 - -----------------------------------------------------------------------------------------
```

#### Summary:
- Used reporter for CPU energy was [MCP]({{< relref "/docs/measuring/metric-providers/cpu-energy-RAPL-MSR-component" >}})
- The effective CPU energy overhead in a loaded system is **0.9 %**
- The idle CPU energy overhead in an idle system is **153 %**
    - As stated before, use this value only for debugging in low power systems
- CPU Power overhead is **0.25 W**