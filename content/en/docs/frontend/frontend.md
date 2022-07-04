---
title : "Green Metrics Frontend"
description: "Green Metrics Frontend"
lead: ""
date: 2022-06-16T08:48:23+00:00
lastmod: 2022-06-16T08:48:23+00:00
draft: false
images: []
---

The Green Metrics Frontend is the part of our tool that actually displays 
the raw and unprocessed data from the API in a nice visual form.

The frontend relies on a [Fomantic UI Template](https://fomantic-ui.com/) and uses [Dygraphs](https://dygraphs.com/)
for charting.

Apart from that we use no Javascript Framework, as we merly do fetch-requests
and then a bit of reformatting.

We leave React and similar for the more elaborate folks out there :)


## Old Frontend / Chart alternative

In the old 0.1-beta version of our tool we used:
- [Material Dash from Bootstrap Dash](https://www.bootstrapdash.com/product/material-design-template-free/)
- [Apex Charts](https://apexcharts.com/)

We decided to not continue with Boostrap Dash, cause the template was just too 
convoluted with CSS classes and was just not clear and expressive enough to work with.

ApexCharts could not handle the amout of datapoints we wanted to process, although
it looked way nicer.

So if you plan on measurements < 30 Minutes than ApexCharts might be a good choice for a frontend charting library.
Please checkout our old release where we still used the library if you need a 
starting point how to integrate it: [Release v0.1-beta](https://github.com/green-coding-berlin/green-metrics-tool/releases/tag/v0.1-beta) 
