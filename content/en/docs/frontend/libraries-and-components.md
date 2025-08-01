---
title : "Libraries and components"
description: "Libraries and components"
date: 2022-06-16T08:48:23+00:00
lastmod: 2022-06-16T08:48:23+00:00
draft: false
weight: 601

images: []
---

The Dashboard is the part of our tool that displays the raw unprocessed and aggretaged
data from the API in a nice visual form.

The frontend relies on a [Fomantic UI Template](https://fomantic-ui.com/) and uses [eCharts](https://echarts.apache.org/en/index.html)
for charting.

Apart from that we use no Javascript Framework, as we merely do fetch-requests
and then a bit of reformatting.

We leave React and similar for the more fancy folks out there :)

## CSS Framework

We use [Fomantic UI](https://www.fomantic-ui.com) as a CSS Framework.

The framework was chosen since it creates a very clean HTML code with only minimal overhead
through class names (like for instance Boostrap has).

We use only the shipped components and modules that come with the framework.

The only addition is the sidebar functionality, which is self-rolled, since it could  
not handle the dynamic chart resizing we needed.
The sidebar is done in flexbox.

- All custom JS files we did live in `/frontend/js`.
- All custom CSS files we did live in `/frontend/css`
- All library files which live in `/frontend/dist/`
  + In the `site.min.css` from Fomantic UI where we removed the @import statement for the external fonts.
  + We removed the `emoji.min.css` because it contained external imports
  + We removed the `flags.min.css` because it contained external imports
  + We then concatenated all the minified file into a `semantic_reduced.min.css`
- The JS files from Fomantic UI are all included separately, since we don't need most of the components
- We use the standard theme for Fomantic UI

## Charts

We use the [eCharts Library](https://echarts.apache.org/).

On the website you can select a custom build by only including the needed charts in the Javascript file.

Our selection was:

- Only Bar, Line, Pie and Radar chart
- Only Grid coordinate system
- All Components included
- Utilities included
- Code Compression

## Old Frontend / Chart alternative

In the old 0.1-beta version of our tool we used:

- [Material Dash from Bootstrap Dash](https://www.bootstrapdash.com/product/material-design-template-free/)
- [Apex Charts](https://apexcharts.com/)

We decided to not continue with Bootstrap Dash, cause the template was just too
convoluted with CSS classes and was just not clear and expressive enough to work with.

ApexCharts could not handle the amount of datapoints we wanted to process, although
it looked way nicer.

So if you plan on measurements < 30 Minutes than ApexCharts might be a good choice for a frontend charting library.
Please checkout our old release where we still used the library if you need a
starting point how to integrate it: [Release v0.1-beta](https://github.com/green-coding-solutions/green-metrics-tool/releases/tag/v0.1-beta)
