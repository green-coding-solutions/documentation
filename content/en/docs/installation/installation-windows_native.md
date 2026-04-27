---
title: "Installation on Windows (Native)"
description: "A description on how to install the GMT natively on Windows machines without WSL"
date: 2026-04-24T00:00:00+00:00
weight: 305
toc: true
---

{{< callout context="caution" icon="outline/alert-triangle" >}}
Running GMT natively on Windows is supported without WSL. However, Docker Desktop still runs Linux containers in a virtualized environment. Measurements from this setup are therefore not directly comparable to Linux bare-metal measurements.
{{< /callout >}}

Unlike the [WSL setup →]({{< relref "installation-windows" >}}), this guide installs GMT directly on Windows. Python runs natively on Windows, Docker Desktop runs the GMT containers as Linux containers, and the RAPL provider is a small C binary that talks to a kernel driver. **No WSL is needed**, and none of the steps from the Linux guide apply here — follow this page end-to-end.

If you ever get stuck, close and reopen your terminal. Several of the steps below modify `PATH` and environment variables, and a fresh shell picks them up reliably.

## Prerequisites

You need the following installed on your Windows host before running the installer. Each item is described in its own section below.

1. Git for Windows
2. Docker Desktop for Windows (with Linux containers)
3. Python 3.10+ (from the Microsoft Store)
4. The Microsoft Visual C++ compiler (`cl.exe`)
5. The `windows-rapl-driver` from hubblo-org
6. Administrator access to a PowerShell session (for the install script)

## Step 1 — Install Git for Windows

Download and install from [git-scm.com/download/win](https://git-scm.com/download/win). Accept the default options; the important part is that `git.exe` ends up on your `PATH`.

Verify:

```powershell
git --version
```

Then clone GMT:

```powershell
git clone https://github.com/green-coding-solutions/green-metrics-tool.git
cd green-metrics-tool
git submodule update --init --recursive
```

## Step 2 — Install Docker Desktop for Windows

Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/).

{{< callout context="note" icon="outline/info-circle" >}}
Unlike the WSL installation guide, we explicitly use Docker Desktop here. Python runs on Windows, Docker Desktop runs the GMT containers (Postgres, Redis, nginx, API) on its Linux VM. This is the only supported container setup for the native Windows install — no further Docker configuration is needed.
{{< /callout >}}

After installing, start Docker Desktop and make sure:

- The Docker engine is running.
- **Linux containers** mode is selected (this is the default).

Verify from PowerShell:

```powershell
docker version
docker compose version
```

## Step 3 — Install Python from the Microsoft Store

Install Python 3.12 (or any supported 3.10+ release) from the Microsoft Store. The Store build is published by the Python Software Foundation and ships with the full standard library — including `venv`, which GMT's installer uses to create `venv\`.

Open the Microsoft Store, search for **"Python"**, and install it. The Store installer automatically puts `python.exe` and `python3.exe` on your `PATH` and handles updates for you.

Close and reopen PowerShell so the updated `PATH` takes effect, then verify:

```powershell
python --version
python -m venv --help
```

GMT's installer finds Python by looking for `py.exe`, `python.exe`, or `python3.exe` on `PATH` in that order — the Store install puts `python.exe` and `python3.exe` there automatically.

## Step 4 — Install the Microsoft Visual C++ compiler

The Windows RAPL provider is a native C binary that GMT compiles during installation. To build it, the installer needs to call `cl.exe` — the MSVC compiler.

Install either of:

- **Visual Studio 2022 Community** (free) — during installation select the workload **"Desktop development with C++"**.
- **Build Tools for Visual Studio 2022** — a smaller standalone installer that only ships the command-line toolchain.

Download from [visualstudio.microsoft.com/downloads/](https://visualstudio.microsoft.com/downloads/).

There are two ways to make `cl.exe` available to the install script:

1. **Recommended:** run `install_windows.ps1` from an **"x64 Native Tools Command Prompt for VS 2022"** (or the equivalent Developer PowerShell). In this shell `cl.exe` is already on `PATH`.
2. **Alternative:** run from a regular PowerShell. The installer will locate Visual Studio via `vswhere.exe` and invoke `vcvarsall.bat` automatically before compiling. This works for most default installations.

If the installer cannot find the compiler, it will print a warning and skip building the RAPL binary — the rest of the install still succeeds, and you can build the binary later by running `build.bat` in [metric_providers/cpu/energy/rapl/scaphandre/component/](metric_providers/cpu/energy/rapl/scaphandre/component/) from an "x64 Native Tools Command Prompt".

## Step 5 — Install the Windows RAPL kernel driver

To read CPU energy counters on Windows you need a kernel driver that exposes the RAPL MSRs. GMT uses the driver from hubblo-org:

<https://github.com/hubblo-org/windows-rapl-driver/>

Follow the instructions in that repository to install it. In short:

1. Download the latest release.
2. Enable test-signing mode (required to load a non-Microsoft-signed driver):

    ```powershell
    bcdedit.exe /set testsigning on
    ```

    Then reboot.
3. Install and start the driver with the shipped loader:

    ```powershell
    .\DriverLoader.exe install
    .\DriverLoader.exe start
    ```

    `DriverLoader.exe start` must be run before each GMT measurement — the driver exposes the device `\\.\ScaphandreDriver` that the GMT provider opens. If the device is not present, the provider's `check_system` call will fail.

### Metric providers on Windows

With the driver loaded, the following provider is available and already configured in `config.yml` under the `windows:` section:

- CPU energy via Intel/AMD RAPL (ScaphandreDrv)
    - Config: `cpu_energy_rapl_scaphandre_component`
    - Sampling rate: `99` ms (default)
    - Domains: `cpu_package`, `cpu_cores`, `cpu_gpu`, `dram`, `psys` — individual domains can be disabled in `config.yml`

All other metric providers are Linux-only and should remain commented out. If your CPU does not expose a given RAPL domain, the binary skips it at startup — you do not need to configure it by hand.

## Step 6 — Run the installer

Open PowerShell **as Administrator** (Administrator is required so the installer can write to `C:\Windows\System32\drivers\etc\hosts`). `cd` into the cloned repository and run:

```powershell
.\install_windows.ps1
```

The installer will:

1. Verify Git, Docker, and Python 3.10+ are available.
2. Ask whether to enable the ScenarioRunner, Eco CI, CarbonDB, and PowerHOG modules.
3. Ask for API / dashboard URLs, timezone, Postgres password, and optional SSL certificates.
4. Patch `docker/compose.yml`, `config.yml`, nginx configs, and `frontend/js/helpers/config.js` with your answers.
5. Append the required entries to the Windows hosts file:

    ```plain
    127.0.0.1 green-coding-postgres-container green-coding-redis-container
    127.0.0.1 api.green-coding.internal metrics.green-coding.internal
    ```

6. Create a Python virtual environment in `venv\`, install all Python requirements, and drop a `gmt-lib.pth` file so the `lib/` package is importable.
7. Compile `metric-provider-binary.exe` via `cl.exe` (see Step 4).
8. Build and pull the Docker containers.

All flags from the Linux installer work here too — for example:

```powershell
.\install_windows.ps1 -DbPassword "changeme" -NoBuildContainers -DisableSsl
```

Run `.\install_windows.ps1 -?` (or read the `param(...)` block at the top of the script) for the full list.

## Step 7 — Activate the venv and run GMT

Every new shell needs the venv activated:

```powershell
.\venv\Scripts\Activate.ps1
```

Then start Docker Desktop, make sure the RAPL driver is started (`DriverLoader.exe start`), and run a measurement as usual:

```powershell
python runner.py --uri <path-to-your-usage-scenario-repo> --name "My test run"
```

The frontend is reachable at the `metrics_url` you configured (defaults to `http://metrics.green-coding.internal:9142`) and the API at the `api_url` (defaults to `http://api.green-coding.internal:9142`).

## Troubleshooting

- **"Docker was not found in PATH"** — start Docker Desktop and verify `docker version` runs cleanly in the same PowerShell session.
- **"Python version is NOT greater than or equal to 3.10"** — activate the correct version with `pyenv global <version>` and open a new shell.
- **"MSVC compiler (cl.exe) not found"** — either rerun the installer from an "x64 Native Tools Command Prompt for VS 2022", or run `build.bat` manually in [metric_providers/cpu/energy/rapl/scaphandre/component/](metric_providers/cpu/energy/rapl/scaphandre/component/).
- **RAPL provider fails with "device not found"** — the ScaphandreDrv driver is not loaded. Run `DriverLoader.exe start` and check that `\\.\ScaphandreDriver` exists.
- **Hosts entries missing** — rerun the installer as Administrator, or add the two lines listed in Step 6 to `C:\Windows\System32\drivers\etc\hosts` by hand.
