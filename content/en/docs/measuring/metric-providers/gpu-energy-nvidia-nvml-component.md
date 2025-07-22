---
title: "GPU energy - NVIDIA NVML - Component"
description: "Documentation for GpuEnergyNvidiaNvmlComponentProvider of the Green Metrics Tool"
lead: ""
date: 2024-01-06T08:49:15+00:00
draft: false
images: []
weight: 150
---

### What it does

This metric provider gets the current GPU power draw from the NVIDIA SMI software.

### Classname

- `GpuEnergyNvidiaNvmlComponentProvider`

### Metric Name

- `gpu_energy_nvidia_nvml_component`

### Prerequisites & Installation

We assume that the NVIDIA graphics card and the associated drivers are installed on your system.

Please resort to [NVIDIA Docs](https://developer.nvidia.com) for installation if you still need to install.

GMT will try to install the needed C header and development files for the *Metrics Provider* to compile.

You can trigger this by adding `--nvidia-gpu` to the install script. If the installation fails, please resort to your OS documentation. e.g.: [NVIDIA Linux docs](https://docs.nvidia.com/cuda/cuda-installation-guide-linux)

### Running your code on our hosted service

Please check on our [Measurement Cluster]({{< relref "/docs/measuring/measurement-cluster" >}}) page which *CUDA* version is installed. You must use the same CUDA version if you have compiled artifacts in your containers.

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
./metric-provider-binary -i 100
```

### Output

This metric provider prints to Stdout a continuous stream of data. The format of the data is as follows:

`TIMESTAMP READING`

Where:
- `TIMESTAMP`: Unix timestamp, in microseconds
- `READING`: The energy used by the GPU in milliWatts (Ex: 12230 for 12.23 Watts)
- `CARD NAME`: The name of the graphics card as reported by the driver

Any errors are printed to Stderr.

Example:
```console
1748166115636640 17757 "NVIDIA GeForce GTX 1080-0"
```

### How it works

The provider uses the *NVIDIA* native C libraries to read directly from a syscall.