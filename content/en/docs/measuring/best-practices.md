---
title: "Best practices"
description: "Best practices for measuring with the Green Metrics Tool"
lead: "Best practices for measuring with the Green Metrics Tool"
date: 2022-06-14T08:49:15+00:00
weight: 808
toc: true
---

One very important note, that serves as a general rule for all usage of the Green Metrics Tool:

All energy measurements and / or benchmarks on a normal operating system are by nature error prone and uncomparable with different systems. Please never compare our values with values on your system. Measurements of software can only ever be compared on the exact same system. 

Also measurements should never be seen as ground truth, but only as indicator of the order of magnitude.

Our system is designed to raise awareness and educate about the software energy use in 
typical off-the-shelf systems.

This reduces its accuracy and reproducibility, but increases its general applicability.

The result is that you get an idea of the order of magnitude the energy consumption is in, but 
does typically not allow you to make comparisons on exact numbers.


## List of best practices
- Never compare between machines to judge your software
    + At least not within small margins. Energy measurements on multi-task operating systems do always have noise and variance. 
    + However a comparison by the order of magnitude is very helpful to judge the underlying hardware
        * In order to judge software on different hardware your systems must be calibrated and run no non-deterministic componentes like schedulers (realtime linux kernel for instance)
    + Even systems with identical hardware components can have variations that you cannot easily account for, as there are unknown varaibles unless you measure them ahead (component energy consumption variance etc.)
- An application should NEVER come to the bounds of its resources. 
    + Analyze the peak load of your application. If the sytem runs at >80% typically scheduling and queuing problems can kick in.
- The application you want to test must run at least twice as long as the minimal resolution 
  you have configured with your Metric Providers
    + Also be aware that Intel RAPL has a minimum time resolution of ~10ms and CPU time resolution is typically around 1 microsecond.
- When running tests your disk load should not go over 50%, since typically linux systems can run in congestion above 60% and also our tool needs some disk time.
    + Check `iostat -xmdz` if in doubt
- You should not exceed 10 Metric Reporters on 100 ms resolution, or 2 metric reporters
  on 10 ms resolution as this will produce a non-signifant load on the system and might skew results.
- Try to keep the resolution of all metric reporters identical. This allows for easier 
  data drill-down later.
- Optimally your tests should have in terms of energy a Std.Dev. of < 1% to make them resonably comparable. 
    + We understand that if you have random effects in your code this might not be achievable. In that case opt for very high repetitions to get a narrower confidence interval.
- Keep the default idle times of 5 seconds for the containers unless you have a specific reason not to. 
- When designing `flows` try to think of the *standard usage scenario* that is representative for the interaction with your app
    + Factor in the idle time that your app has. Typically a web browser for instance is mostly idle, as users read. 
    + Nevertheless the browser does use the CPU during that time and consumes energy. Therefore it is an important part to have in your `flow`
- Use notes to make `flows` better understandable
- Use our measurement service for reproducibility and visibility of your measurements