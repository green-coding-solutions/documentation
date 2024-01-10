---
title: "GPU energy - NVIDIA SMI - Component"
description: "Documentation for GpuEnergyNvidiaSmiComponentProvider of the Green Metrics Tool"
lead: ""
date: 2024-01-06T08:49:15+00:00
draft: false
images: []
weight: 180
---

### What it does

This metric provider gets the current GPU power draw from the NVIDIA SMI software.

### Classname

- `GpuEnergyNvidiaSmiComponentProvider`

### Metric Name

- `gpu_energy_nvidia_smi_component`

### Prerequisites & Installation

You first must install the *CUDA Toolkit* from *NVIDIA* for the metric provider to have the needed libraries and binars. The URL at the time of writing is here: [https://developer.nvidia.com/cuda-downloads](https://developer.nvidia.com/cuda-downloads)

You need both:
- Base Installer
- Driver Installer

To check if the installation has succeeded you can run:
```console
$ nvidia-smi -q
```

After the installation you system can use language bindings for your matching *CUDA* version. 
Please check on our [Measurement Cluster]({{< relref "/docs/measuring/measurement-cluster" >}}) page which *CUDA* version is installed.

#### Debugging

If you cannot generate any output you should first check if your GPU is supported by *NVIDIA CUDA* on their [list for *CUDA* support](https://developer.nvidia.com/cuda-gpus).

Then you should check if the kernel module was corretly loaded with `dmesg`.
Sometimes a message like this appears: 
```log
The NVIDIA GPU 0000:01:00.0 (PCI ID: 10de:1081)
NVRM: installed in this system is not supported by open
NVRM: nvidia.ko because it does not include the required GPU
NVRM: System Processor (GSP).
```

In this case you should [switch to the legacy kernel module](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#switching-between-driver-module-flavors) 

Check in `sudo dmesg` if the kernel module could correctly be lodaded and then verify through `cat /proc/driver/nvidia/version`. See also details on the [NVIDIA support page](https://download.nvidia.com/XFree86/Linux-x86_64/515.43.04/README/kernel_open.html)

### Input Parameters

- args
    - `-i`: interval in milliseconds

By default the measurement interval is 100 ms.

```bash
./metric-provider-nvidia-smi-wrapper.sh -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The estimated % CPU used

Any errors are printed to Stderr.


### How it works

The provider uses the `nvidia-smi` tool to read the data.
