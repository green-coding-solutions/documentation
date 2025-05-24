---
title: "Measuring AI/ML applications"
description: ""
lead: ""
date: 2025-05-23T01:49:15+00:00
weight: 840
toc: true
---

GMT can also measure AI/ML workloads.

### Example for ML workload

See [our example ML example application](https://github.com/green-coding-solutions/example-applications/tree/main/ml-model) to have a usage scenario for a simple Python ML workload to get started.

### Example for GenAI Text LLM workload

The simplest way is to use [ollama](https://ollama.com) as a manager and encapsulate it inside of the GMT.

See [our example ollama LLM example application](https://github.com/green-coding-solutions/example-applications/tree/main/ai-model) to have a usage scenario to get started.

#### Quick LLM query measuring

Since LLM chat queries are so common GMT comes with a quick measurement function for that.

In the root folder you find the `run-template.sh` file.

Measure a sample query like this: `bash run-template.sh ai "How cool is the GMT?"`

It will download ollama, setup the containers and download an example model (*gemma3:1b*). Once you got this quick measurement running iterate on it by using our [our example ollama LLM example application](https://github.com/green-coding-solutions/example-applications/tree/main/ai-model).

Bonus tip: If you apply `--quick` to the `run-template.sh` call the measurement is quicker for debugging purposes. However results will be not as reliable. Use only for debugging!

#### Trying out our hosted service

We operate [green-coding.ai](https://green-coding.ai) as a simple demo vertical that uses the underlying [Green Metrics Tool Cluster Hosted Service →]({{< relref "/docs/measuring/measuring-service/" >}}).

Check it out if you do not feel like installing the GMT and just want to get carbon and energy info on single prompts.