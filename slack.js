function testPost() {
  let ret = sendSlackMessage("hoge");
  console.log(ret);
  console.log(ret.ts);
}

function sendToSlack(aggregatedPapers, stats) {
  if (Object.keys(aggregatedPapers.papers).length <= 0) {
    return;
  }

  let headerResponse = sendHeader(aggregatedPapers, stats);
  const sortedPapers = aggregatedPapers.getSortedPapers();
  console.log(JSON.stringify(headerResponse))

  sortedPapers.forEach((paper) => {
    let response = sendPaper(paper, headerResponse.ts);
    console.log(JSON.stringify(response));
    Utilities.sleep(1000);
  });
}

function sendHeader(aggregatedPapers, stats) {
  let currentDate = new Date();
  let header = [
    {
      type: "header",
      text: {
        "type": "plain_text",
        "text": `Scholar Alert - ${currentDate.toDateString()}`,
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `${Object.keys(aggregatedPapers.papers).length} new paper${Object.keys(aggregatedPapers.papers).length !== 1 ? 's' : ''}`
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "text": `${stats.messages} message${stats.messages !== 1 ? 's' : ''}, ${stats.errors} error${stats.errors !== 1 ? 's' : ''}`,
          "type": "mrkdwn"
        }
      ]
    },
    {
      "type": "divider"
    }
  ];

  return sendSlackMessage(header);
}

function sendPaper(paper, threadTs) {
  // Slack's header limit is 150 characters
  let title;
  if (paper.title.length > 150 - 3) {
    title = paper.title.slice(0, 147) + "...";
  } else {
    title = paper.title;
  }

  let sources = {};
  paper.refs.forEach((ref) => {
    if (!sources[ref.sourceInfo.type]) {
      sources[ref.sourceInfo.type] = [...ref.sourceInfo.keys];
    } else {
      sources[ref.sourceInfo.type].push(...ref.sourceInfo.keys);
    }
  });

  let contents = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": title,
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": paper.author
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:link: ${paper.url}`
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": `:bell: *${paper.frequency} alert${paper.frequency !== 1 ? 's' : ''}*`
        },
        {
          "type": "mrkdwn",
          "text": `${Object.keys(sources).map((type) => sources[type].length > 0 ? `*${capitalize(type)}*: ${sources[type].join(' | ')}` : `*${capitalize(type)}*`).join('\n')}`,
        }
      ]
    },
    {
      "type": "divider"
    }
  ]

  let attachments = [{
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": paper.abstract.firstLine + paper.abstract.rest
        }
      },
    ]
  }];

  return sendSlackMessage(contents, attachments, threadTs);
}

function sendSlackMessage(message, attachments = null, threadTs = null) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('SLACK_TOKEN');
  const channel = scriptProperties.getProperty('SLACK_CONVERSATION_ID');
  let url = 'https://slack.com/api/chat.postMessage';

  let payload = {
    "channel": channel,
    "blocks": message
  };

  if (attachments) {
    payload["attachments"] = attachments;
  }

  if (threadTs) {
    payload["thread_ts"] = threadTs; // スレッドのタイムスタンプ
  }

  let options = {
    "method": "post",
    "contentType": "application/json; charset=utf-8",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "payload": JSON.stringify(payload)
  };

  let response = UrlFetchApp.fetch(url, options);
  response = JSON.parse(response.getContentText());
  if (!response.ok) {
    throw new Error(response.errors.join('; ') + '\n' + JSON.stringify(options));
  }

  return response;
}

// 文字列をキャピタライズする関数
function capitalize(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
