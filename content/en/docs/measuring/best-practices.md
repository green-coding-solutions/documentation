Best Practices.md


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

  Practices: 5 secpnds idle, 1 minute burn in, Factor in idle time, measurement start is signaled in data