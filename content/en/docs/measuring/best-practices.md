---
title: "Best practices"
description: "Best practices for measuring with the Green Metrics Tool"
lead: "Best practices for measuring with the Green Metrics Tool"
date: 2022-06-14T08:49:15+00:00
draft: false
toc: true
---


- The application you want to test must run at least twice as long as the minimal resolution 
  you have configured with your Metric Providers
    + Also be aware that Intel RAPL has a minimum time resolution of ~10ms and CPU time resolution is typically around 1 microsecond.
- When running tests your disk load should not go over 50%, since typically linux systems can run in congestion above 60% and also our tool needs some disk time.
    + Check iostat iostat -xmdz if in doubt
- When you start a reporter it will typically put on its own thread. By doing so
  you will potentially get a core out of its sleep mode. This might lead to a 
  skewed display on the System energy, as cores leaving sleep mode directly consume a lot 
  more of energy but do technically only minimal report for the reporters.
      + This effect is also seen in multi-threaded but low load apps. When using 
        system energy metrics they are (unfairly?) reported as using higher energy
        Therefore we encourage to always run with a fixed setup of Metric Reporters
- You should not exceed 10 Metric Reporters on 100 ms resolution, or 2 metric reporters
  on 10 ms resolution.
- Keep the resolution of all metric reporters identical. This allows for easier 
  data drill-down later.
- Optimally your tests should have in terms of energy a STDDEV of < 1% to make them resonably comparable. We understand that 
  if you have random effects in your code this might not be achievable. In that case opt for very high repetitions to get a narrower confidence interval.

  => => Show Dan my script

  Practices: 5 secpnds idle, 1 minute burn in, Factor in idle time, measurement start is signaled in data