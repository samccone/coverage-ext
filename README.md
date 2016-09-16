## What is this?

This is an extension to an old version of chrome + a custom istanbul reporter.
This combo gives you the power to view what JS gets evaluated on any website.

![image](https://cloud.githubusercontent.com/assets/883126/18592140/6535c56a-7bea-11e6-88e5-dff9d8f0789c.png)

## Installation

1. Download an **old version of chrome**  [Mac](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/314206/) / [Win](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win/314199/)
  - The reason why we have to use an old version is because we are utilizing a cool API chrome used to have to preprocess any JS file before it gets evaluated by v8. This feature was reverted [here](https://codereview.chromium.org/761143003).
2. [Download this repo](https://github.com/samccone/coverage-ext/archive/master.zip) and extract it somewhere
3. Open a prompt in the `reporter` directory
4. `npm i`
5. Run the old chrome version
6. Navigate to `chrome://extensions` and enable developer mode
7. Click "Load unpacked extension..." and select the `extension` folder from the repo

## Example Usage

1. Visit `http://news.ycombinator.com/`.
2. Open up dev tools.
3. Click on the get coveragez button.
4. The page will reload, wait for it to complete.
5. Click on the copy button.
6. Run `pbpaste > ycombinator-data`.
7. `cd reporter`.
8. `node gen_report.js ../ycombinator-data`
9. open `./reporter/html-report/index.html` to view the report
