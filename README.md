# Documentation of the Green Metrics Tool

This is only the source.

Here is the [Live Version](https://docs.green-coding.berlin)

## Updating

The theme is a child-theme of [Doks](https://getdoks.org/docs/).

The main theme is referenced as node_module and thus updating is handled via npm.

Following files have been overloaded and should be checked if they are changed on an update:
- /layouts/partials/* (Removed integrity protection to run on Cloudflare CDN)
- /layouts/index.headers (Removed CSP netlify)
- /layouts/sitemap.xml (was not rendering without)

## Deploying to Cloudflare

- Framework preset: `hugo`
- Build command: `npm install && hugo`
- HUGO_VERSION: `0.99.0`
- NODE_VERSION: `NODE_VERSION`

## Measuring energy for build

If you want to measure the energy just use the `usage_scenario.yml` file inside
which will tell you how much Joules / kWh the build will cost.

You can find all the measurements on https://metrics.green-coding.berlin/ by searching
for the repository URL.

<img src="https://img.shields.io/badge/Energy%20cost%20for%20build-~5%20J-orange">
