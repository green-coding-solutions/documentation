---
title: "Measuring GUI applications"
description: ""
lead: ""
date: 2024-08-20T01:49:15+00:00
weight: 839
toc: true
---

GMT can also measure GUI applications that need an active Window Manager (X11 / Wayland etc).

We only support Linux atm but will update this page once further OS are supported.

### Linux

Wayland and X11 are supported, whereas Wayland is currently accessed through an X11 bridge.

The most typical way GMT is currently used with GUI applications is a browser. Therefore this documentation focuses on *Firefox* as an example, but it should work with any Linux GUI app.

#### Firefox example

We will create a temporary folder in `/tmp/my_test` and initialize *git* inside of this folder so that GMT can pick it up.

Create a usage scenario as follows:

**usage_scenario.yml**
```yaml
---
name: Sample GMT Firefox headed demo
author: Arne Tarara <arne@green-coding.io>
description: Opens Firefox running in a docker container with a GUI window on Ubuntu Linux

services:
  gcb-playwright:
    image: greencoding/gcb_playwright:v15
    volumes:
       - /tmp/.X11-unix:/tmp/.X11-unix # allows to bind to X11 wayland bridge
    environment:
       DISPLAY: ":0" # Set this to the output of `echo $DISPLAY` on your system
flow:
  - name: Start Firefox via Playwright
    container: gcb-playwright
    commands:
      - type: console
        command: python3 /tmp/repo/test.py
```

We are using the image of our containerized Playwright Firefox and Chromium. Any GUI app that you have in a container should work though.

As said in the comment the `DISPLAY` variable should be set to the output of `$ echo $DISPLAY` in your system. It is typically `:0`.

Here is also the short boilerplate code of the `test.py` that we need for this example.

**test.py**
```python
import sys
import time

from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as playwright:
        browser = playwright.firefox.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto('https://www.green-coding.io/')
        page.set_default_timeout(240_000) # 240 seconds (timeout is in milliseconds)
        time.sleep(10)
        browser.close()

if __name__ == '__main__':
    main()
```

As a final step we must allow docker to access the X11 / Wayland connection via: `$ xhost +local:docker`

The we can run this line:
```bash
python3 runner.py --uri /tmp/my_test --name "Testing Firefox GUI" --allow-unsafe
```

The important part here is the `--allow-unsafe` switch will allows to properly mount the `/tmp/.X11-unix` folder, which would otherwise be forbidden.

Now the browser should open and access https://www.green.coding.io

### Windows

Currently not supported

### macOS

Theoretically macOS should be possible if you install *X Server* on your system. This however is untested.

Let us know if you try it out and it works!

### Automating for cluster

If you are running GMT unattended in cluster mode you must ensure two things:
- The user that the GMT runs with must be automatically also logged into a GUI session. This typically happens in the user settings of the desktop (for instance Gnome).
- Futhermore the `xhost +local:docker` must be set also in the Desktop. In an unattended mode this must happen with files that are loaded via autostart.

#### X11 autostart file
Add `xhost +local:docker` to `~/.xprofile`

Example: `$ xhost +" >> ~/.xprofile`

#### Wayland autostart file
Create a file `~/.config/autostart/xhost-docker.desktop`

Content:
```config
[Desktop Entry]
Type=Application
Exec=xhost +local:docker
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Allow Docker X11 / Wayland
```

### Help / Debugging
If you run into any errors see the [Debugging →]({{< relref "debugging" >}}) page.
