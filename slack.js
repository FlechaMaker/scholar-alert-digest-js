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
  console.log(JSON.stringify(headerResponse));

  sortedPapers.forEach((paper) => {
    sendPaper(paper, headerResponse.ts);
    Utilities.sleep(1000);
  });
}

function sendHeader(aggregatedPapers, stats) {
  let currentDate = new Date();
  let header = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `Scholar Alert - ${currentDate.toDateString()}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${Object.keys(aggregatedPapers.papers).length} new paper${
          Object.keys(aggregatedPapers.papers).length !== 1 ? "s" : ""
        }`,
      },
    },
    {
      type: "context",
      elements: [
        {
          text: `${stats.messages} message${stats.messages !== 1 ? "s" : ""}, ${
            stats.errors
          } error${stats.errors !== 1 ? "s" : ""}`,
          type: "mrkdwn",
        },
      ],
    },
    {
      type: "divider",
    },
  ];

  return sendSlackMessage(header);
}

function linkAuthors(authors, linkPrefix, linkSuffix) {
  const authorsLink = authors
    .map((author) => `${linkPrefix}${capitalize(author)}${linkSuffix}`)
    .join(", ");

  return authorsLink;
}

const scriptProperties = PropertiesService.getScriptProperties();

function transformedData(url, callback) {
  const m = url.match(/acm\.org.*doi\/(?:[a-z]+\/)?((.*)\/(.*))$/);
  if (m == null) {
    callback(null);
    return;
  }
  const doi = m[1];
  const options = {
    "method": "post",
    "contentType": "application/x-www-form-urlencoded; charset=UTF-8",
    "payload": `dois=${doi}&targetFile=custom-endNote&format=endNote`,
    "muteHttpExceptions": true,
  };
  const response = UrlFetchApp.fetch(
    "https://dl.acm.org/action/exportCiteProcCitation",
    options
  );

  let json;
  try {
    json = JSON.parse(response.getContentText());
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    callback(null);
    return;
  }

  if (!json || !json.items || !json.items[0] || !json.items[0][doi]) {
    console.error("Invalid JSON structure:", json);
    callback(null);
    return;
  }

  const entry = json.items[0][doi];
  const scrapboxName = scriptProperties.getProperty("SCRAPBOX_NAME");
  let scrapboxURL;
  if (scrapboxName) {
    scrapboxURL = composeExtendedScrapboxURLFromACMAPI(url, entry);
  }

  const obsidianVault = scriptProperties.getProperty("OBSIDIAN_VAULT");
  let obsidianURL;
  if (obsidianVault) {
    obsidianURL = composeExtendedObsidianURLFromACMAPI(url, entry);
  }

  const transformedData = {
    abstract: entry.abstract,
    scrapboxURL: scrapboxURL,
    obsidianURL: obsidianURL,
  };
  callback(transformedData);
}

function composeScrapboxURL(paper) {
  const scrapboxName = scriptProperties.getProperty("SCRAPBOX_NAME");
  if (!scrapboxName) {
    return null;
  }

  let titleURL = encodeURIComponent(paper.title);
  let linkedAuthors = linkAuthors(paper.authors, "[", "]");
  let scrapboxURL = `https://scrapbox.io/${scrapboxName}/${titleURL}?body=${encodeURIComponent(
    linkedAuthors +
      "\n" +
      addProxyURL(paper.url) +
      "\n\n[** Abstract]\n" +
      paper.abstract.firstLine +
      " " +
      paper.abstract.rest +
      "\n\n[** Memo]\n"
  )}`;

  // Shorten the body if the URL is too long. The maximum length of a URL is 3000 characters.
  for (let i = 0; scrapboxURL.length > 3000; i++) {
    const body =
      linkedAuthors +
      "\n" +
      addProxyURL(paper.url) +
      "\n\n[** Abstract]\n" +
      paper.abstract.firstLine +
      " " +
      paper.abstract.rest +
      "\n\n[** Memo]\n";
    const body1 = body.slice(0, body.length - i);
    scrapboxURL = `https://scrapbox.io/${scrapboxName}/${titleURL}?body=${encodeURIComponent(
      body1
    )}`;
  }

  return scrapboxURL;
}

function composeExtendedScrapboxURLFromACMAPI(url, entry) {
  const scrapboxName = scriptProperties.getProperty("SCRAPBOX_NAME");
  if (!scrapboxName) {
    return null;
  }

  const authors = entry.author;
  const title = `${authors[0].given} ${authors[0].family}: ${entry.title}`;
  var body = [];
  body.push("[[タイトル]]");
  body.push(` [${entry.title} ${addProxyURL(url)}]`);
  body.push("[[著者]]");
  for (const author of authors) {
    body.push(` [${author.given} ${author.family}]`);
  }
  body.push("[[ソース]]");
  body.push(" " + entry["container-title"]);
  body.push("[[年]]");
  body.push(" " + entry.issued["date-parts"]);
  body.push("[[ページ]]");
  body.push(" " + entry.page);
  body.push("[[概要]]");
  body.push(" " + entry.abstract);
  body.push("[[DOI]]");
  body.push(" " + entry.DOI);
  body.push("[[URL]]");
  body.push(" " + addProxyURL(entry.URL));
  body.push("[[キーワード]]");
  body.push(" " + entry.keyword);
  body.push("[[出版社]]");
  body.push(" " + entry.publisher);
  body.push("[[本文]]");
  body.push(" " + ` [${entry.title}_EN]`);
  body.push(" " + ` [${entry.title}_JP]`);
  body.push("[[コメント]]");

  // const title0 = title.replace(/\?/g, '%' + '3f').replace(/&/g, '%' + '26');
  const body0 = body.join("\n");
  let scrapboxURL = `https://scrapbox.io/${scrapboxName}/${encodeURIComponent(
    title
  )}?body=${encodeURIComponent(body0)}`;

  // Shorten the body if the URL is too long. The maximum length of a URL is 3000 characters.
  while (scrapboxURL.length > 3000) {
    body.pop(); // remove last element to shorten the body
    const body1 = body.join("\n");
    scrapboxURL = `https://scrapbox.io/${scrapboxName}/${encodeURIComponent(
      title
    )}?body=${encodeURIComponent(body1)}`;
  }

  return scrapboxURL;
}

function composeObsidianURL(paper) {
  const vault = scriptProperties.getProperty("OBSIDIAN_VAULT");
  const folder = scriptProperties.getProperty("OBSIDIAN_FOLDER_PATH");
  if (!vault) {
    return null;
  }

  const authorsFamilyNames = paper.authors.map((author) =>
    author.split(" ").at(-1)
  );
  const authorsListWithoutLast = authorsFamilyNames.slice(0, -1);
  let authorsList;
  if (paper.authors.length > 1) {
    authorsList =
      authorsListWithoutLast.join(", ") + " & " + authorsFamilyNames.slice(-1);
  } else {
    authorsList = authorsFamilyNames[0];
  }
  const authoryear = `${authorsList} ${paper.year}`;
  const file = folder ? `${folder}/${authoryear}` : authoryear;
  const linkedAuthors = linkAuthors(paper.authors, "[[", "]]");
  const abstract = paper.abstract.firstLine + " " + paper.abstract.rest;
  const body = `${linkedAuthors}. ${paper.year}. ${paper.title}. [${
    paper.url
  }](${addProxyURL(paper.url)})

## Abstract
${abstract}
`;

  const obsidianURL = `obsidian://new?vault=${encodeURIComponent(
    vault
  )}&file=${encodeURIComponent(file)}&content=${encodeURIComponent(body)}`;

  return obsidianURL;
}

function composeExtendedObsidianURLFromACMAPI(url, entry) {
  const vault = scriptProperties.getProperty("OBSIDIAN_VAULT");
  const folder = scriptProperties.getProperty("OBSIDIAN_FOLDER_PATH");
  if (!vault) {
    return null;
  }

  const authors = entry.author;
  const authorsFamilyNames = authors.map((author) => author.family);
  const authorsListWithoutLast = authorsFamilyNames.slice(0, -1);
  let authorsList;
  if (authors.length > 1) {
    authorsList =
      authorsListWithoutLast.join(", ") + " & " + authorsFamilyNames.slice(-1);
  } else {
    authorsList = authorsFamilyNames[0];
  }
  const authoryear = `${authorsList} ${entry.issued["date-parts"][0][0]}`;
  const file = folder ? `${folder}/${authoryear}` : authoryear;
  const linkedAuthors = authors.map(
    (author) => `[[${author.given} ${author.family}]]`
  );
  const linkedAuthorsWithoutLast = linkedAuthors.slice(0, -1);
  let linkedAuthorsList;
  if (authors.length > 1) {
    linkedAuthorsList =
      linkedAuthorsWithoutLast.join(", ") + " & " + linkedAuthors.slice(-1);
  } else {
    linkedAuthorsList = linkedAuthors[0];
  }
  const body = `${linkedAuthorsList}. ${entry.issued["date-parts"][0][0]}. ${
    entry.title
  }. ${entry["container-title"]}. ${entry.page}. [DOI:${
    entry.DOI
  }](${addProxyURL(entry.URL)}).

## Abstract
${entry.abstract}

## Keywords
${entry.keyword
  .split(", ")
  .map((keyword) => `#${keyword.replace(/\s/g, "_")}`)
  .join(" ")}
`;

  const obsidianURL = `obsidian://new?vault=${encodeURIComponent(
    vault
  )}&file=${encodeURIComponent(file)}&content=${encodeURIComponent(body)}`;

  return obsidianURL;
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

  let abstract = paper.abstract.firstLine + " " + paper.abstract.rest;

  let scrapboxURL;
  const scrapboxName = scriptProperties.getProperty("SCRAPBOX_NAME");
  if (scrapboxName) {
    scrapboxURL = composeScrapboxURL(paper);
  }

  let obsidianURL;
  const obsidianVault = scriptProperties.getProperty("OBSIDIAN_VAULT");
  if (obsidianVault) {
    obsidianURL = composeObsidianURL(paper);
  }

  // URLの変換を試みる
  transformedData(paper.url, function (transformedData) {
    if (transformedData?.scrapboxURL) {
      scrapboxURL = transformedData.scrapboxURL;
    }
    if (transformedData?.obsidianURL) {
      obsidianURL = transformedData.obsidianURL;
    }
    if (transformedData?.abstract) {
      abstract = transformedData.abstract;
    }

    let contents = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title || "No title",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${paper.authors.join(", ")}` || "No authors",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:link: <${addProxyURL(paper.url)}|${paper.url}>`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `:bell: *${paper.frequency} alert${
              paper.frequency !== 1 ? "s" : ""
            }*`,
          },
          {
            type: "mrkdwn",
            text:
              `${Object.keys(sources)
                .map((type) =>
                  sources[type].length > 0
                    ? `*${capitalize(type)}*: ${sources[type].join(" | ")}`
                    : `*${capitalize(type)}*`
                )
                .join("\n")}` || "No sources",
          },
        ],
      },
    ];

    // Save to Buttons
    if ((scrapboxName && scrapboxURL) || (obsidianVault && obsidianURL)) {
      let actions = {
        type: "actions",
        elements: [],
      };
      if (scrapboxName && scrapboxURL) {
        actions.elements.push({
          type: "button",
          text: {
            type: "plain_text",
            text: ":inbox_tray: Save to Scrapbox",
            emoji: true,
          },
          url: scrapboxURL,
        });
      }

      if (obsidianVault && obsidianURL) {
        actions.elements.push({
          type: "button",
          text: {
            type: "plain_text",
            text: ":inbox_tray: Save to Obsidian",
            emoji: true,
          },
          url: obsidianURL,
        });
      }

      contents.push(actions);
    }

    contents.push({
      type: "divider",
    });

    let attachments = [
      {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: abstract || "No abstract",
            },
          },
        ],
      },
    ];

    const response = sendSlackMessage(contents, attachments, threadTs);
    console.log(JSON.stringify(response));

    return response;
  });
}

function sendSlackMessage(message, attachments = null, threadTs = null) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty("SLACK_TOKEN");
  const channel = scriptProperties.getProperty("SLACK_CONVERSATION_ID");
  let url = "https://slack.com/api/chat.postMessage";

  let payload = {
    channel: channel,
    blocks: message,
  };

  if (attachments) {
    payload["attachments"] = attachments;
  }

  if (threadTs) {
    payload["thread_ts"] = threadTs; // スレッドのタイムスタンプ
  }

  let options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer " + token,
    },
    payload: JSON.stringify(payload),
  };

  let response = UrlFetchApp.fetch(url, options);
  response = JSON.parse(response.getContentText());
  if (!response.ok) {
    throw new Error(
      response.errors.join("; ") + "\n" + JSON.stringify(options)
    );
  }

  return response;
}

function addProxyURL(url) {
  const proxyURL = scriptProperties.getProperty("PROXY_URL");
  const proxyDomains = scriptProperties.getProperty("PROXY_DOMAINS");
  if (!proxyURL) {
    return url;
  }

  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/;
  const match = url.match(regex);
  const hostname = match && match[1];
  if (
    typeof proxyDomains === "string" &&
    proxyDomains.split(" ").includes(hostname)
  ) {
    return `${proxyURL}${url}`;
  }

  return url;
}

// 文字列をキャピタライズする関数
function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
