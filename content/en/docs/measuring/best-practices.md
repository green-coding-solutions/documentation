---
title: "Best practices"
description: "Best practices for measuring with the Green Metrics Tool"
lead: "Best practices for measuring with the Green Metrics Tool"
date: 2022-06-14T08:49:15+00:00
weight: 809
toc: true
---

One very important note, that serves as a general rule for all usage of the Green Metrics Tool:

{{< alert icon="❗️" text="All energy measurements and / or benchmarks on a normal operating system are by nature error prone and incomparable with different systems. Please never compare our values with values on your system. Measurements of software can only be compared on the exact same system." />}}

Having said that: If you have a proper transfer function between systems or just want to estimate the general **overhead** a 100-core machine compared to an Arduino for just running an email server you can still do a comparison ... just keep in mind, it will have caveats and can only provide guidance.

Also measurements should never be seen as ground truth, but only as indicator of the order of magnitude.

Our system is designed to raise awareness and educate about the software energy use in 
typical off-the-shelf systems.

This reduces its accuracy and reproducibility, but increases its general applicability.

The result is that you get an idea of the order of magnitude the energy consumption is in, but 
reduces comparability to identical systems.

Our [Hosted Service]({{< relref "measuring-service" >}}) on our [Measurement Cluster]({{< relref "measurement-cluster" >}}) is designed for exactly that.


## List of best practices

### 1. Never compare between machines to judge your software
- At least not within small margins. Energy measurements on multi-task operating systems do always have noise and variance. 
- However a comparison by the order of magnitude is very helpful to judge the underlying hardware
    + In order to judge software on different hardware your systems must be calibrated and run no non-deterministic components like schedulers (realtime linux kernel for instance)
- Even systems with identical hardware components can have variations that you cannot easily account for, as there are unknown variables unless you measure them ahead (component energy consumption variance etc.)
- Some comparisons make sense though if you have a tuned [Measurement Cluster]({{< relref "measurement-cluster" >}})

### 2. An application should NEVER come to the bounds of its resources.
- Analyze the peak load of your application. If the sytem runs at >80% typically scheduling and queuing problems can kick in.

### 3. The application you want to test must run at least twice as long as the minimal resolution
- The minimal resolution is the one you have configured with your [Metric Providers]({{< relref "metric-providers" >}})
    + Also be aware that Intel RAPL has a minimum time resolution of ~10ms and CPU time resolution is typically around 1 microsecond.

### 4. When running tests your disk load should not go over 50%
- Since typically linux systems can run in congestion above 60% and also our tool needs some disk time.
    + Check `iostat -xmdz` if in doubt

### 5. Limit amount and resolution of Metric Providers to what you absolutely need
- Do not exceed 10 Metric Reporters on 100 ms resolution, 
- or 2 metric reporters on 10 ms resolution as this will produce a non-significant load on the system and might skew results.
- Try to keep the resolution of all metric reporters identical. This allows for easier data drill-down later.

### 6. Always check STDDEV
- Optimally your tests should have in terms of energy a Std.Dev. of < 1% to make them resonably comparable. 
    + We understand that if you have random effects in your code this might not be achievable. In that case opt for very high repetitions to get a narrower confidence interval.

### 7. Design representative *Standard Usage Scenarios*
- When designing `flows` try to think of the *standard usage scenario* that is representative for the interaction with your app
    + Factor in the idle time that your app has. Typically a web browser for instance is mostly idle, as users read. 
    + Nevertheless the browser does use the CPU during that time and consumes energy. Therefore it is an important part to have in your `flow`
- Use notes to make `flows` better understandable

### 8. Pin your depencies
- If you build Docker containers be sure to always specify hashes / versions in the `apt-get install` commands and also in the `FROM` commands if you ingest images. By versions we mean here something like `FROM alpine@sha256:be746ab119f2c7bb2518d67fbe3c511c0ea4c9c0133878a596e25e5a68b0d9f3` instead of just `FROM alpine`. If that is not an option be sure to use at least double-dotted semantic versioning like `FROM alpine:1.2.3`
- For dependencies in `npm`, `pip` or any other package manager also pin the versions
- Same goes for `docker-compose.yml` /  `compose.yml` files etc.
- This practice helps you spot changes to the software infrastructure your code is running on and understand changes that have been made by third parties, which influence your energy results.

### 9. Use a tuned Measurement Cluster or our Hosted Service for reproducability and visiblity
- Use our measurement service for reproducibility and visibility of your measurements

### 10. Trigger test remotely or keep system inactive
- Our [Measurement Cluster]({{< relref "measurement-cluster" >}}) runs tests fully autonomous. In dev setups this is however seldomly the case. To still get good results the system should be as noise free as possible.
- This means, if possible:
    + Turn your wifi and internet off
    + Do not touch the keyboard or the mouse
        * Never move your mouse or type something on your keyboard while measuring, because the interrupts of the CPU will interfere with the measurement.
    + Do not have dimming or monitor-sleep active as this will cost CPU cycles to trigger
    + Turn off any cronjobs / updates / housekeeping jobs on the system
    + Turn off any processes you do not need atm.
- Or put more loosely: Listening to spotify while running an energy test is a bad idea :)

