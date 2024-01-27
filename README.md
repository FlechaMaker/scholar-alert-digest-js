# Scholar Alert Digest for Google Apps Script

## Overview
This repository contains a JavaScript adaptation of Alexander Bezzubov's original Go-based project [bzz/scholar-alert-digest](https://github.com/bzz/scholar-alert-digest), designed to run on Google Apps Script. The purpose of this adaptation is to streamline the process of reviewing Google Scholar alerts by combining them into a single digest, with the added feature of posting alerts to Slack.

## Purpose
To reduce the effort of checking multiple Google Scholar Alerts emails by consolidating them into a single, organized report and posting that summary to Slack.

## Features include
- **Aggregation of alerts**: Gathers information from Google Scholar Alert emails into a consolidated report.
- **Sort by Alert Count**: Sorts the collected literature information by the number of alerts.
- **Slack integration**: As a unique feature not available in the original Go version, this script posts the sorted and aggregated alerts directly to Slack.

<img width="411" alt="スクリーンショット 2024-01-27 19 15 19" src="https://github.com/FlechaMaker/scholar-alert-digest-js/assets/6488324/670a111a-1b5f-4c7a-9a79-af9978a5f682">

## Prerequisites
- Google Scholar Alerts must be set up to arrive in your Gmail.
- The script should be created with the same Google account that receives these Scholar Alerts in Gmail.

## Setting up the script properties
Set the following script properties in the Google Apps script configuration.
- [GMAIL_LABEL] Gmail label for Google Scholar Alerts. (e.g. Google Scholar)
- [SLACK_TOKEN] Slack token for authentication. (e.g. xoxb-00000...)
- [SLACK_CONVERSATION_ID] ID of the Slack channel where the alerts are posted. (e.g. C000000000000)

## Usage
To use this script:
1. Copy the script to your Google Apps script.
    - To upload to Google Apps Script, use [clasp](https://github.com/google/clasp) for convenience.
2. Make sure the necessary script properties are set.
3. Follow `main.js` for usage examples.

## Acknowledgements
Special thanks to Alexander Bezzubov for the Go-based implementation of Scholar Alert Digest. This JavaScript adaptation builds on his work with additional functionality for Slack integration.
