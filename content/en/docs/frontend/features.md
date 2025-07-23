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

