// Paper is a map key, thus aggregation takes into account all its fields.
class Paper {
  constructor(title, url, authors = [], year, abstract, refs = [], freq = 1) {
    this.title = title;
    this.url = url;
    this.authors = authors;
    this.year = year;
    this.abstract = abstract;
    this.refs = refs;
    this.frequency = freq;
  }
}

// Ref saves information about a source, referencing the paper.
class Ref {
  constructor(id, title, sourceInfo) {
    this.id = id;
    this.title = title;
    this.sourceInfo = sourceInfo;
  }
}

// SourceInfo saves information about the alert source.
class SourceInfo {
  constructor(type, key) {
    this.type = type;
    this.keys = key;
  }
}

// Abstract represents a view of the parsed abstract.
class Abstract {
  constructor(firstLine, rest) {
    this.firstLine = firstLine;
    this.rest = rest;
  }
}

// AggPapers represents an aggregated collection of Papers.
class AggregatedPapers {
  constructor() {
    this.papers = {};
  }

  addPaper(key, paper) {
    if (!this.papers[key]) {
      this.papers[key] = paper;
    } else {
      // If a paper with the same key already exists, increment its frequency.
      this.papers[key].frequency++;
      this.papers[key].refs.push(...paper.refs);
    }
  }

  // Function to get sorted papers by frequency
  getSortedPapers() {
    const sortedPapers = Object.values(this.papers);

    // Sort the papers in descending order based on frequency
    sortedPapers.sort((a, b) => b.frequency - a.frequency);

    return sortedPapers;
  }
}

// Stats is a number of counters with stats on paper extraction from Gmail messages.
class Stats {
  constructor(messages) {
    this.messages = messages;
    this.titles = 0;
    this.errors = 0;
  }
}

function aggregatePapersFromMessages(messages) {
  let status = new Stats(messages.length);
  let uniqTitles = new AggregatedPapers();
  let processedMessages = [];

  for (let message of messages) {
    let papers;
    try {
      papers = extractPapersFromMessage(message, true);
    } catch (error) {
      status.errors++;
      console.error(error);
      continue;
    }
    status.titles += papers.length;
    papers.forEach((paper) => {
      uniqTitles.addPaper(paper.title, paper);
    });
    if (papers.length > 0) {
      processedMessages.push(message);
    }
  }

  return { status, processedMessages, uniqTitles };
}

function extractPapersFromMessage(message, includeAuthors) {
  const subject = message.getSubject();
  const body = message.getBody();

  const sourceInfo = extractSourceInfoFromSubject(subject);
  if (sourceInfo.type == "unknown") {
    // タイプが不明なメッセージは処理しない
    return [];
  }

  // HTMLを解析
  const titles = extractPaperTitlesFromHTML(body).map((s) =>
    decodeHtmlEntities(s)
  );
  const urls = extractURLFromHTML(body);

  if (titles.length !== urls.length) {
    const errorMessage = `${titles.length} titles but only ${urls.length} URLs found in email: ${subject}`;
    throw new Error(errorMessage);
  }

  let citedPapers = [];
  if (sourceInfo.type == "citation") {
    citedPapers = extractCitedPapers(body).map((s) => decodeHtmlEntities(s));
  }

  const publicationStrs = extractH3FollowingSiblingDiv1(body).map((s) =>
    decodeHtmlEntities(s)
  );
  const abstracts = extractH3FollowingSiblingDiv2(body).map((s) =>
    decodeHtmlEntities(s)
  );

  const papers = [];
  for (let i = 0; i < titles.length; i++) {
    let authors = [];
    const title = titles[i].trim();
    const abstract = abstracts[i].trim().replace(/<br\s*\/?>/g, "");
    if (includeAuthors) {
      authors = extractAuthorsFromElement(publicationStrs[i]);
    }
    const year = extractYearFromElement(publicationStrs[i]);

    let url;
    try {
      url = extractURLFromAttribute(urls[i]);
    } catch (error) {
      console.log(`Skipping paper "${title}" in "${subject}": ${error}`);
      continue;
    }

    const maxChars = 80;
    const lookahead = 10;
    const { firstLine, rest } = separateFirstLine(
      abstract,
      maxChars,
      lookahead
    );
    const abstractInfo = new Abstract(firstLine, rest);

    let currentSourceInfo;
    if (titles.length === citedPapers.length) {
      let newKeys = [...sourceInfo.keys];
      newKeys.push(citedPapers[i]);
      currentSourceInfo = new SourceInfo(sourceInfo.type, newKeys);
    } else {
      currentSourceInfo = sourceInfo;
    }

    papers.push(
      new Paper(
        title,
        url,
        authors,
        year,
        abstractInfo,
        [new Ref(message.getId(), subject, currentSourceInfo)],
        1
      )
    );
  }

  return papers;
}

// "//h3/a"
function extractPaperTitlesFromHTML(html) {
  const regex = /<h3[^>]*>[\s\S]*?<a[\s\S]*?>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/gi;
  return matchAll(regex, html);
}

// "//h3/a/@href"
function extractURLFromHTML(html) {
  const regex =
    /<h3[^>]*>[\s\S]*?<a[\s\S]*?href="([^"]+)"[\s\S]*?>[\s\S]*?<\/a>[\s\S]*?<\/h3>/gi;
  return matchAll(regex, html);
}

// "//h3/following-sibling::div[1]"
function extractH3FollowingSiblingDiv1(html) {
  const regex =
    /<h3[^>]*?>[\s\S]*?<\/h3>[\s\S]*?<div[^>]*?>([\s\S]*?)<\/div>/gi;
  return matchAll(regex, html);
}

// "//h3/following-sibling::div[2]"
function extractH3FollowingSiblingDiv2(html) {
  const regex =
    /<h3[^>]*?>[\s\S]*?<\/h3>[\s\S]*?<div[^>]*?>[\s\S]*?<\/div>[\s\S]*?<div[^>]*?>([\s\S]*?)<\/div>/gi;
  return matchAll(regex, html);
}

// only works on citation type
function extractCitedPapers(html) {
  const regex =
    /(?:Cites: |引用: |1 件目の引用[\s\S]*?<\/span>[\s\S]*?<span[^>]*>)\u202a?([\s\S]+?)\u202c?&nbsp;&nbsp;<\/span>/gi;
  return matchAll(regex, html);
}

function matchAll(regex, s) {
  const matches = [];

  let match;
  while ((match = regex.exec(s)) !== null) {
    const m = match[1];
    matches.push(m);
  }

  return matches;
}

function extractAuthorsFromElement(publication) {
  let authorsStr = publication.split("-")[0].trimRight();

  const separators = /[,&;]|and|\n/gi;
  const removePattern = new RegExp(
    "[\\d†\\*…]" + // 数字、†、*, … を削除
      "|(\\s[a-z])+(\\s*$)" + // 単一小文字による注釈を削除
      // 名前以外の文字列・URLを削除
      "|ORCID" +
      "|View ORCID Profile" +
      "|Author links open overlay panel" +
      "|https?:\\/\\/\\S+",
    "gi" // グローバル検索、大文字小文字を区別しない
  );
  const capitalize = (words) =>
    words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const authors = authorsStr
    .replace(separators, ",")
    .split(",")
    .map((author) => author.replace(removePattern, "").trim())
    .filter((author) => author.length > 1)
    .map((author) => capitalize(author));

  return authors;
}

function extractYearFromElement(publication) {
  const yearMatch = publication.match(/(\d{4})$/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

var scholarURLPrefix = new RegExp(
  "http(s)?://scholar\\.google\\.[\\p{L}]+(\\.[\\p{L}]+)?/scholar_url\\?url=",
  "u"
);

// extractURLFromAttribute returns an actual paper URL from the given scholar link.
// Does not validate URL format but extracts it ad-hoc by trimming suffix/prefix.
function extractURLFromAttribute(scholarURL) {
  // drop scholarURLPrefix
  var prefixLoc = scholarURL.match(scholarURLPrefix);
  if (!prefixLoc) {
    throw new Error(
      'URL "' + scholarURL + '" does not have the expected prefix.'
    );
  }
  var longURL = scholarURL.substring(prefixLoc[0].length);

  // drop suffix (after &), if any
  var suffixIndex = longURL.indexOf("&");
  if (suffixIndex >= 0) {
    longURL = longURL.substring(0, suffixIndex);
  }

  return decodeURIComponent(longURL);
}

function extractSourceInfoFromSubject(subject) {
  let alertType = "";
  let alertKey = [];

  // Case: New papers in your profile
  if (subject.includes("自分のプロフィールの新しい論文")) {
    alertType = "new paper";
    alertKey.push("me");
  }
  // Case: New articles for a specific author
  else if (
    subject.includes("新しい論文") ||
    subject.includes("new articles") ||
    subject.includes("Новые статьи пользователя")
  ) {
    alertType = "new paper";
    alertKey.push(subject.split(" - ")[0]);
  }
  // Case: New research related to a specific author
  else if (
    subject.includes("関連する新しい研究") ||
    subject.includes("new related research") ||
    subject.includes("Новые статьи, связанные с работами автора")
  ) {
    alertType = "new related research";
    alertKey.push(subject.split(" - ")[0]);
  }
  // Case: Citations to your own paper
  else if (subject.includes("自分の論文からの引用")) {
    alertType = "citation";
    alertKey.push("me");
  }
  // Case: New citation with a specific keyword
  else if (
    subject.includes("の論文からの引用") ||
    subject.includes("to articles by")
  ) {
    alertType = "citation";
    if (subject.includes("さんの論文からの引用")) {
      alertKey.push(subject.split(" さんの論文からの引用")[0]);
    } else {
      const match = subject.match(/(\d+) new citations? to articles by (.+)$/);
      if (match) {
        const authorName = match[2];
        alertKey.push(authorName);
      }
    }
  } else if (
    subject.includes("新しい引用") ||
    subject.includes("new citations") ||
    subject.includes(": новые ссылки")
  ) {
    alertType = "citation";
    alertKey.push(subject.split(";")[0].replace("「", ""));
  } else if (
    subject.includes("おすすめの論文") ||
    subject.includes(
      "Рекомендуемые статьи"
    ) /* || subject.includes("??? English ver.") */
  ) {
    alertType = "recommended paper";
  } else if (
    subject.includes("新しい結果") ||
    subject.includes("new results") ||
    subject.includes("Новые результаты по запросу")
  ) {
    alertType = "new results";
    let keyComponents = subject.split(";")[0];
    alertKey = keyComponents
      .match(/"([^"]+)"/g)
      .map((s) => s.replace(/"/g, ""));
  } else {
    alertType = "unknown";
  }

  return new SourceInfo(alertType, alertKey);
}

// SeparateFirstLine returns text, split into two parts: first short line and the rest.
// N + lookahead is the maximum length of the first line. Split is done on Unicode whitespace,
// if any around N +/- lookahead runes, or at the Nth rune.
function separateFirstLine(text, N, lookahead) {
  // 文字列全体をUnicodeホワイトスペースで分割
  const words = text.split(/\s+/);

  // 分割された単語を連結して最初の行を作成
  let firstLine = words[0];
  for (let i = 1; i < words.length; i++) {
    if (firstLine.length + words[i].length <= N + lookahead) {
      firstLine += " " + words[i];
    } else {
      break;
    }
  }

  // 最初の行と残りの部分を返す
  const rest = text.substring(firstLine.length).trim();
  return { firstLine, rest };
}

// Decode all HTML escapes in the input
function decodeHtmlEntities(input) {
  return input
    .replace(/&#(\d+);/g, function (match, dec) {
      return String.fromCharCode(dec);
    })
    .replace(/&quot;/g, '"') // Convert &quot; to "
    .replace(/&amp;/g, "&") // Convert &amp; to &
    .replace(/&lt;/g, "<") // Convert &lt; to <
    .replace(/&gt;/g, ">"); // Convert &gt; to >
}
