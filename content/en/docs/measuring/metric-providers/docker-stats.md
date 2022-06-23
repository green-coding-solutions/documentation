

Here the calculation of CPU and memory is shown:

https://github.com/docker/cli/blob/53f8ed4bec07084db4208f55987a2ea94b7f01d6/cli/command/container/stats_helpers.go


```cpu
func calculateCPUPercentUnix(previousCPU, previousSystem uint64, v *types.StatsJSON) float64 {
    var (
        cpuPercent = 0.0
        // calculate the change for the cpu usage of the container in between readings
        cpuDelta = float64(v.CPUStats.CPUUsage.TotalUsage) - float64(previousCPU)
        // calculate the change for the entire system between readings
        systemDelta = float64(v.CPUStats.SystemUsage) - float64(previousSystem)
        onlineCPUs  = float64(v.CPUStats.OnlineCPUs)
    )

    if onlineCPUs == 0.0 {
        onlineCPUs = float64(len(v.CPUStats.CPUUsage.PercpuUsage))
    }
    if systemDelta > 0.0 && cpuDelta > 0.0 {
        cpuPercent = (cpuDelta / systemDelta) * onlineCPUs * 100.0
    }
    return cpuPercent
}
```


```memory
func calculateMemUsageUnixNoCache(mem types.MemoryStats) float64 {
    // cgroup v1
    if v, isCgroup1 := mem.Stats["total_inactive_file"]; isCgroup1 && v < mem.Usage {
        return float64(mem.Usage - v)
    }
    // cgroup v2
    if v := mem.Stats["inactive_file"]; v < mem.Usage {
        return float64(mem.Usage - v)
    }
    return float64(mem.Usage)
}
```
=> This is on cgroup v2 identical to our cgroup-memory provider