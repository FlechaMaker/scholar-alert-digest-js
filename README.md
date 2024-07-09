# Scholar Alert Digest for Google Apps Script

## Overview

This repository contains a JavaScript adaptation of Alexander Bezzubov's original Go-based project [bzz/scholar-alert-digest](https://github.com/bzz/scholar-alert-digest), designed to run on Google Apps Script. The purpose of this adaptation is to streamline the process of reviewing Google Scholar alerts by combining them into a single digest, with the added feature of posting alerts to Slack.

## Purpose

To reduce the effort of checking multiple Google Scholar Alerts emails by consolidating them into a single, organized report and posting that summary to Slack.

## Features include

- **Aggregation of alerts**: Gathers information from Google Scholar Alert emails into a consolidated report.
- **Sort by Alert Count**: Sorts the collected literature information by the number of alerts.
- **Slack integration**: This script can post the sorted and aggregated alerts to Slack.
- **_Save to_ buttons**: Save paper data to your notebook applications by a click.

<img width="469" alt="screenshot" src="https://github.com/FlechaMaker/scholar-alert-digest-js/assets/6488324/9cb85220-d6af-4b18-9d23-4f578e182fd2">

## Prerequisites

- Google Scholar Alerts must be set up to arrive in your Gmail, and this script (Google Apps Script) should be run by the same Google Account.
  - Please label the Google Scholar Alerts emails with a specific label (e.g. Google Scholar).
- The script should be created with the same Google account that receives these Scholar Alerts in Gmail.
- You have a your own Slack App installed to the Slack workspace where the alerts to be sent by the Slack App.
  - You have a Slack token and the ID of the Slack channel where the alerts are posted.
  - Make sure the Slack App has the chat:write permission.
  - To get the Slack token, you can check the official tutorial: https://api.slack.com/tutorials/tracks/getting-a-token
- You should have nodejs installed on your local machine if you use clasp.

## Usage

### Create a Google Apps Script project and upload the script

```sh
# Clone the repository
git clone https://github.com/FlechaMaker/scholar-alert-digest-js.git
cd scholar-alert-digest-js

# Install clasp and login to Google
npm install -g @google/clasp
clasp login  # Make sure to login with the same Google account that receives the Scholar Alerts!

# Create a new Google Apps Script project
clasp create --type standalone --title "Scholar Alert Digest"

# Upload the script to the Google Apps Script project
clasp push

# Open the Google Apps Script project to continue the following settings
clasp open
```

or you can manually copy and paste JavaScript files (.js) to the Google Apps Script project.

### Setting up the script properties

Set the following script properties in the Google Apps script configuration.

- **GMAIL_LABEL** Gmail label for Google Scholar Alerts. (e.g. Google Scholar)
- **SLACK_TOKEN** Slack token for authentication. (e.g. xoxb-00000...)
- **SLACK_CONVERSATION_ID** ID of the Slack channel where the alerts are posted. (e.g. C000000000000)
  - You can copy the conversation ID by clicking right button on the channel name and selecting "Copy > Copy link".

### Usage

Follow `main.js` for usage examples. Execute `main` function to aggregate and post alerts.
You can schedule the script to run at regular intervals to receive the latest alerts. Make a trigger to run the `main` on the Google Apps Script project interface.

## Acknowledgements

Special thanks to Alexander Bezzubov for the Go-based implementation of Scholar Alert Digest. This JavaScript adaptation builds on his work with additional functionality for Slack integration.
