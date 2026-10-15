---
title : "Features"
description: "Frontend Features"
date: 2024-12-09T08:48:23+00:00
draft: false
weight: 604
images: []
---

This is something like an unordered list of frontend features which are maybe helpful if you use the GMT.

## 1. Deeplinking

GMT allows deeplinking in *stats* and *compare* views by directly opening a phase-tab.

To do so just append a *#* followed by the phase name and optionally followed by two underscores (\_\_) and a sub-phase name.

Example:

- https://metrics.green-coding.io/stats.html?id=1ec10430-a789-44c9-8f7e-c394fc708b25
  + This would always open the *Runtime* phase tab

- https://metrics.green-coding.io/stats.html?id=1ec10430-a789-44c9-8f7e-c394fc708b25#BASELINE
  + This would open the *Baseline* phase tab

- https://metrics.green-coding.io/stats.html?id=1ec10430-a789-44c9-8f7e-c394fc708b25#RUNTIME__Stress
  + This would open the *Runtime* phase tab with the *Stress* sub-phase

## 2. Yearly carbon simulation

The yearly simulation estimates how much CO2 a run would cause in every electricity grid zone of the world. It uses the average carbon intensity of a whole year for each zone.

### Opening the simulation

On the stats page of a run open the *Analytics* tab and then the *Carbon Simulation* sub-tab. It has two buttons. *Open Yearly Simulation* opens the yearly simulation for this run in a new window. *Open Carbon Simulation* opens the older time based simulation, which is described at the end of this section.

The *Carbon Simulation* sub-tab is only shown if the dashboard has an Elephant Carbon Service URL configured (`ELEPHANT_URL` in `frontend/js/helpers/config.js`). The install script asks for this URL, or you can pass it with `--elephant-url`. The yearly simulation itself does not use Elephant. Without Elephant you can still open it directly with `/simulation-yearly.html?id=<RUN_ID>`.

### Inputs

- *Year* selects which yearly average to use. 2021, 2022, 2023, 2024 and 2025 are available. The most recent year is selected by default.
- *Energy Metric* is the energy metric of the run that is used. If the run has PSU energy metrics (names starting with `psu_energy_`) only these are offered. Otherwise all metrics containing `_energy_` are listed. `psu_energy_ac_mcp_machine` is preselected if the run has it.
- *Phase* is the phase whose energy is used. All phases of the run are listed, including the sub-phases of the *Runtime* phase, but without hidden ones. *Runtime* is the default.
- *Number of code runs* is how often you expect the code to be run, since software normally does not run only once. The default is 1000.

The *Run Details* box shows the *Total Energy* of the selected metric in the selected phase.

### Results

The table *CO2 emissions per grid zone* has one row for each of the 352 Electricity Maps zones in the data. Each row shows a flag where one is available, the zone code, the country or region, the carbon intensity in gCO2eq/kWh, the share of renewable energy and of carbon free energy in percent, and the *Estimated Run Emissions (gCO2eq)*. The estimate is calculated like this.

```txt
Estimated Run Emissions [gCO2eq] = energy of the phase [kWh] x carbon intensity of the zone [gCO2eq/kWh] x number of code runs
```

The table is sorted by the estimated emissions with the highest value first. You can search it and sort it by the other columns.

The green plus button at the end of a row copies the row to the *Saved Rows* table above. Saved rows additionally show the year and the number of runs, so you can switch the year or change the number of runs and compare the results side by side. The trash icon removes a saved row. Saved rows only live in the open page and are lost when you reload or close it. They also do not record which metric and phase they were calculated with.

### Data source

The carbon intensity data is bundled with the frontend in `frontend/js/yearly_co2/`. It is the yearly Electricity Maps data that ships with the [CO2.js](https://github.com/thegreenwebfoundation/co2.js) library. The data is licensed under the Open Database License (ODbL). The attribution to Electricity Maps is in the `LICENSE` file of the Green Metrics Tool, and the methodology is described at [electricitymaps.com](https://www.electricitymaps.com/data/methodology).

### Limitations

- The intensities are averages over a whole year. They do not reflect the grid at the time your run was measured or at any specific time of day.
- Only data for the years 2021 to 2025 is included.
- Only one value of the selected metric is used. If the metric has several detail names, the `[MACHINE]` value is taken if it exists and otherwise the first one.

### The time based carbon simulation

The *Open Carbon Simulation* button opens the older simulation page (`/simulation.html?id=<RUN_ID>`). Unlike the yearly simulation it needs Elephant. You select a carbon intensity provider from Elephant and an energy metric of the run. The page multiplies every energy measurement of the run with the carbon intensity the provider reported for that moment and shows the *Total carbon emitted*. You can shift the run in time with buttons from 5 minutes up to 30 days and change the time range of the provider history. *Find best runtime* searches this range for the start time with the lowest emissions. *Find best Provider* does the same for every provider and lists the best start time together with the best and worst gCO2eq of each.

The time based simulation shows at which time and with which provider a run would have caused the least emissions. The yearly simulation gives a rough comparison of grid zones and years based on yearly averages.

## 3. Key metric cards

Each phase on the stats page of a run and on the compare page shows a set of key metric cards. They show the most important metrics of the phase at a glance. All metrics, including the ones on the cards, are listed in the table that opens with *Click here for detailed metrics ...* below the cards.

The cards are grouped in two segments.

- *Hardware* has the tabs *Power*, *Energy* and *CO2*. Each tab has the cards *CPU*, *GPU*, *DRAM*, *Disk* and *Machine*. Your browser remembers the last tab you selected.
- *Impact* has the cards *Phase Duration*, *Data Transferred*, *Network*, *Machine CO₂ (embodied)* and *Grid Intensity*. If the usage scenario defines [custom metrics]({{< relref "/docs/measuring/usage-scenario#custom-metrics" >}}), each of them gets an additional card below. SCI values calculated from custom metrics (names ending in `_sci_global`) get a green card with a leaf icon.

A card without data shows *N/A*. As soon as a card has a value, its title changes to the display name of the metric and the source appears in the top right corner, for example *via cgroup*. The question mark icon shows an explanation of the metric. On the stats page you can hover over the value to see the raw value in its original unit.

On the compare page a card shows either the average with the relative standard deviation, marked *(AVG + STD.DEV)*, or the relative difference between the two compared groups, marked *(Diff. in %)*.

### Default metrics

By default the cards are filled from these metrics. The `*` stands for any text in the metric name. Power, energy and CO2 metrics go to the card on the tab with the same name.

| Card | Metrics |
|------|---------|
| *Machine* | `psu_power_*_machine`, `psu_energy_*_machine`, `psu_carbon_*_machine` |
| *CPU* | `cpu_power_*_component`, `cpu_energy_*_component`, `cpu_carbon_*_component` |
| *GPU* | `gpu_power_*_component`, `gpu_energy_*_component`, `gpu_carbon_*_component` |
| *DRAM* | `memory_power_*_component`, `memory_energy_*_component`, `memory_carbon_*_component` |
| *Disk* | `disk_power_*_component`, `disk_energy_*_component`, `disk_carbon_*_component` |
| *Phase Duration* | `phase_time_syscall_system` |
| *Data Transferred* | `network_io_cgroup_container` |
| *Network* | `network_total_cgroup_container` |
| *Machine CO₂ (embodied)* | `embodied_carbon_share_machine` |
| *Grid Intensity* | every metric starting with `carbon_intensity` and ending in `_machine` |

The *Grid Intensity* card shows the average carbon intensity of the electricity grid during the phase in gCO2e/kWh. It is filled by a carbon intensity provider like [Electricity Maps]({{< relref "/docs/measuring/metric-providers/carbon-intensity-electricitymaps-machine" >}}), [Elephant]({{< relref "/docs/measuring/metric-providers/carbon-intensity-elephant-machine" >}}) or the static provider (`carbon_intensity_static_machine`). The rule also matches `carbon_intensitylevel_electricitymaps_machine`, which reports a level from 1 (low) to 3 (high) instead of gCO2e/kWh.

Administrators can change which metrics feed the cards. See [Customization]({{< relref "/docs/frontend/customization" >}}).

### Several values on one card

A card can receive more than one value in a phase. This happens when a metric has several detail names, for example one per container for the network cards, or when more than one metric matches the same card.

- On the stats page the values are added up. The card shows the sum followed by an icon of two overlapping windows. Its tooltip says *This is an aggregate value based on multiple sources. Please check metrics table for individual values.*
- If a value does not have the same unit as the values before it, nothing is added up. The card shows *Aggregate failure* with the same icon. Its tooltip says *The unit of the aggregate has changed. This is an aggregate value based on multiple sources. Please check metrics table for individual values.*
- On the compare page the values are not added up, because averages with standard deviations and relative differences cannot simply be summed. Such a card shows *Not comparable* with the same icon.

The individual values are always listed in the detailed metrics table.

For the *Grid Intensity* card this means that on the stats page a run with more than one carbon intensity provider shows the sum of their intensities, or *Aggregate failure* if one of them is the intensity level. In that case read the values from the detailed metrics table.
