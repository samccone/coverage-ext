## What is this?

This is an extension to an old version of chrome + a custom istanbul reporter.
This combo gives you the power to view what JS gets evaluated on any website.

## How to use

First we have to download an old version of chrome from [here](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/314206/).

The reason why we have to use an old version is because we are utilizing a cool API chrome used to have to preprocess any JS file before it gets evaluated by v8. This feature was reverted [here](https://codereview.chromium.org/761143003).

Next go to chrome://extensions and enable developer mode. From there click on load unpacked extension and load the extension folder here.

* Visit `http://news.ycombinator.com/`.
* Open up dev tools.
* Click on the get coveragez button.
* The page will reload, wait for it to complete.
* Click on the copy button.
* Run `pbpaste > ycombinator-data`.
* `cd reporter/`.
* `npm i` (if you do not have things installed already).
* `node gen_report.js ../ycombinator-data`
* open `/Users/sam/Desktop/repos/coverage-ext/html-report/index.html`
