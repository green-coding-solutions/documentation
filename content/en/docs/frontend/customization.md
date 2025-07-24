---
title : "Customization"
description: "Customization"
date: 2023-07-12T08:48:23+00:00
lastmod: 2023-07-12T08:48:23+00:00
draft: false
weight: 602
images: []
toc: false
---

The Dashboard and the graphs that are shown are customizable in the metrics they display.

When installing the tool we provide a basic configuration that you can find in the
generated `frontend/js/helpers/config.js` .

For comparison, here is the template file that is checked into the repository: [config.js.example](https://github.com/green-coding-solutions/green-metrics-tool/blob/main/frontend/js/helpers/config.js.example)

The first part of the file should not be modified, as these variables are set by the install script:

```js
API_URL = "__API_URL__"
METRICS_URL = "__METRICS_URL__"
```

The later part you can customize. If you for instance want to have the top chart not display all energy metrics, but
rather only the RAPL energy metrics, change accordingly:

```js
// old
// title and filter function for the top left most chart in the Detailed Metrics / Compare view
const TOP_BAR_CHART_TITLE = 'Energy metrics [mJ]'
const top_bar_chart_condition = (metric) => {
    if(metric.indexOf('_energy_') !== -1) return true;
    return false;
}

// new
// title and filter function for the top left most chart in the Detailed Metrics / Compare view
const TOP_BAR_CHART_TITLE = 'RAPL only energy metrics [mJ]'
const top_bar_chart_condition = (metric) => {
    if(metric.indexOf('_energy_') !== -1 && metric.indexOf('_rapl_') !== -1) return true;
    return false;
}
````

Happy customizing :)
