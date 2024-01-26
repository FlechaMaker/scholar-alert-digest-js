// Test cases for extractPaperURL
function testScholarURLExtraction() {
  var testCases = [
    {
      name: "error",
      scholarURL: "",
      URL: "",
      hasErr: true
    },
    {
      name: "regular .com",
      scholarURL: "http://scholar.google.com/scholar_url?url=https://arxiv.org/pdf/1911.12863&hl=en&sa=X&d=206864271411405978&scisig=AAGBfm07fPzie7SdYtYu_zrwxV7xx4o74g&nossl=1&oi=scholaralrt&hist=KBiQzPUAAAAJ:14254687125141938744:AAGBfm10na1baTgbjiNc57Wm9bK7bSlS3g",
      URL: "https://arxiv.org/pdf/1911.12863",
      hasErr: false
    },
    {
      name: "non .com",
      scholarURL: "http://scholar.google.ru/scholar_url?url=https://www.jstage.jst.go.jp/article/transinf/E102.D/12/E102.D_2019MPP0005/_article/-char/ja/&hl=en",
      URL: "https://www.jstage.jst.go.jp/article/transinf/E102.D/12/E102.D_2019MPP0005/_article/-char/ja/",
      hasErr: false
    },
    {
      name: ".co.jp",
      scholarURL: "http://scholar.google.co.jp/scholar_url?url=https://dl.acm.org/doi/abs/10.1145/3379337.3415831&hl=ja&sa=X&d=17323521467117279604&ei=2H-RX7X0BIKOygSV-YCoCQ&scisig=AAGBfm0sUgXNPcsegVW1Ds0b1UxEXge1OA&nossl=1&oi=scholaralrt",
      URL: "https://dl.acm.org/doi/abs/10.1145/3379337.3415831",
      hasErr: false
    },
    {
      name: ".com.au",
      scholarURL: "http://scholar.google.com.au/scholar_url?url=https://dl.acm.org/doi/abs/10.1145/3379337.3415831&hl=ja&sa=X&d=17323521467117279604&ei=2H-RX7X0BIKOygSV-YCoCQ&scisig=AAGBfm0sUgXNPcsegVW1Ds0b1UxEXge1OA&nossl=1&oi=scholaralrt",
      URL: "https://dl.acm.org/doi/abs/10.1145/3379337.3415831",
      hasErr: false
    },
    {
      name: "another TLD, short URL",
      scholarURL: "https://scholar.google.au/scholar_url?url=http://www.test.com&hl=1",
      URL: "http://www.test.com",
      hasErr: false
    },
    {
      name: "single query (no &)",
      scholarURL: "http://scholar.google.au/scholar_url?url=http://www.test.com",
      URL: "http://www.test.com",
      hasErr: false
    },
    {
      name: "non-latin TLD",
      scholarURL: "https://scholar.google.рф/scholar_url?url=http://www.test.com&hl=1",
      URL: "http://www.test.com",
      hasErr: false
    }
  ];

  testCases.forEach(function (testCase) {
    try {
      var actualURL = extractURLFromAttribute(testCase.scholarURL);
      if (testCase.hasErr) {
        console.error("Expected error for test case: " + testCase.name);
      } else {
        assertEqual(actualURL, testCase.URL, "Test case: " + testCase.name);
      }
    } catch (e) {
      if (!testCase.hasErr) {
        console.error("Unexpected error for test case: " + testCase.name + ": " + e.message);
      }
    }
  });

  Logger.log("All tests passed!");
}


function testExtractAlertInfo() {
  // Define test cases
  var testCases = [
    { input: "Victor R. Lee - 新しい論文", expected: { alertType: "new paper", alertKey: ["Victor R. Lee"] } },
    { input: "Yoichi Ochiai (落合陽一) - new articles", expected: { alertType: "new paper", alertKey: ["Yoichi Ochiai (落合陽一)"] } },
    { input: "堀田龍也 - 新しい論文", expected: { alertType: "new paper", alertKey: ["堀田龍也"] } },
    { input: "自分のプロフィールの新しい論文", expected: { alertType: "new paper", alertKey: ["me"] } },

    { input: "Will McGrath - 関連する新しい研究", expected: { alertType: "new related research", alertKey: ["Will McGrath"] } },
    { input: "Will McGrath - new related research", expected: { alertType: "new related research", alertKey: ["Will McGrath"] } },

    { input: "Stacey Kuznetsov さんの論文からの引用: 1 件", expected: { alertType: "citation", alertKey: ["Stacey Kuznetsov"] } },
    { input: "「TangibleCircuits: An Interactive 3D ...; 言語: 英語, 日本語」 - 新しい引用", expected: { alertType: "citation", alertKey: ["TangibleCircuits: An Interactive 3D ..."] } },
    { input: "1 new citation to articles by Yoonji Kim", expected: { alertType: "citation", alertKey: ["Yoonji Kim"] } },
    { input: "2 new citations to articles by Yoonji Kim", expected: { alertType: "citation", alertKey: ["Yoonji Kim"] } },
    { input: "自分の論文からの引用: 1 件", expected: { alertType: "citation", alertKey: ["me"] } },

    { input: "おすすめの論文", expected: { alertType: "recommended paper", alertKey: [] } },
    { input: "\"Ayano Ohsaki\" OR \"大崎理乃\"; 言語: 英語, 日本語 - 新しい結果", expected: { alertType: "new results", alertKey: ["Ayano Ohsaki", "大崎理乃"] } },
    { input: "\"Ayano Ohsaki\" OR \"大崎理乃\"; language: English, Japanese - new results", expected: { alertType: "new results", alertKey: ["Ayano Ohsaki", "大崎理乃"] } },

    { input: "Yiannis Georgiou さんの論文をフォローしましょう", expected: { alertType: "unknown", alertKey: [] } }
  ];

  // Test each case
  for (var i = 0; i < testCases.length; i++) {
    var testCase = testCases[i];
    var actual = extractSourceInfoFromSubject(testCase.input);
    assertEqual(actual.alertType, testCase.expected.alertType, "Test case " + (i + 1) + " alertType");
    assertEqual(actual.alertKey, testCase.expected.alertKey, "Test case " + (i + 1) + " alertKey");
  }

  Logger.log("All tests passed!");
}

function testSeparateFirstLine() {
  const testCases = [
    { input: "This is an example of a long text that needs to be split into two parts.", N: 20, lookahead: 5, expectedFirstLine: "This is an example of a", expectedRest: "long text that needs to be split into two parts." },
    { input: "abcd", N: 2, lookahead: 2, expectedFirstLine: "abcd", expectedRest: "" },
    { input: "abcdef", N: 2, lookahead: 2, expectedFirstLine: "abcdef", expectedRest: "" },
    { input: "ab cdef", N: 2, lookahead: 2, expectedFirstLine: "ab", expectedRest: "cdef" },
  ];

  for (const testCase of testCases) {
    const [firstLine, rest] = separateFirstLine(testCase.input, testCase.N, testCase.lookahead);
    if (firstLine === testCase.expectedFirstLine && rest === testCase.expectedRest) {
      console.log(`Pass: Input "${testCase.input}", N ${testCase.N}, lookahead ${testCase.lookahead}`);
    } else {
      console.error(`Fail: Input "${testCase.input}", N ${testCase.N}, lookahead ${testCase.lookahead}`);
      console.error(`  Expected First Line: "${testCase.expectedFirstLine}"`);
      console.error(`  Actual First Line: "${firstLine}"`);
      console.error(`  Expected Rest: "${testCase.expectedRest}"`);
      console.error(`  Actual Rest: "${rest}"`);
    }
  }
}

const ScholarAlertMailSingle = `<div style="font-family:arial,sans-serif;font-size:13px;line-height:16px;color:#222;width:100%;max-width:600px">
        <h3 style="font-weight:lighter;font-size:18px;line-height:20px;"></h3>
        <h3 style="font-weight:normal;font-size:18px;line-height:20px;"></h3>
        <h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><span
                style="font-size:13px;font-weight:normal;color:#1a0dab;vertical-align:2px">[PDF]</span> <a
                href="https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;hl=ja&amp;sa=X&amp;d=5123897432430598998&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeZFN1NuM-e3vwW4W5QTHZ5R&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=0&amp;folt=art"
                class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">From Consumers to Critical
                Users: Prompty, an AI Literacy Tool For High School Students</a></h3>
        <div style="color:#006621;line-height:18px">DV Dennison, RCC Garcia, P Sarin, J Wolf, C Bywater… - 2024</div>
        <div class="gse_alrt_sni" style="line-height:17px">In an age where Large Language Models (LLMs) expedite the
            generation of text, the <br>skills for critically evaluating and creating meaningful text using these models
            are <br>often lacking. To help classroom teachers address this, we introduce Prompty, a …</div>
        <div style="width:auto">
            <table cellpadding="0" cellspacing="0" border="0">
                <tbody>
                    <tr>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/citations?hl=ja&amp;update_op=email_library_add&amp;info=VtuPNZG9G0cJ&amp;citsig=AM0yFCkAAAAAZ4Epb3ZRPbWcOB863PEnHbqC1-I"
                                style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img
                                    alt="保存" src="https://scholar.google.com/intl/ja/scholar/images/1x/save-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=tw&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Twitter" src="https://scholar.google.com/intl/ja/scholar/images/1x/tw-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=in&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="LinkedIn" src="https://scholar.google.com/intl/ja/scholar/images/1x/in-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=fb&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Facebook" src="https://scholar.google.com/intl/ja/scholar/images/1x/fb-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                    </tr>
                </tbody>
            </table>
        </div><br>`.replace(/[\r\n ]+/g, " ");

const ScholarAlertMail2 = `<div style="font-family:arial,sans-serif;font-size:13px;line-height:16px;color:#222;width:100%;max-width:600px">
        <h3 style="font-weight:lighter;font-size:18px;line-height:20px;"></h3>
        <h3 style="font-weight:normal;font-size:18px;line-height:20px;"></h3>
        <h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><span
                style="font-size:13px;font-weight:normal;color:#1a0dab;vertical-align:2px">[PDF]</span> <a
                href="https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;hl=ja&amp;sa=X&amp;d=5123897432430598998&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeZFN1NuM-e3vwW4W5QTHZ5R&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=0&amp;folt=art"
                class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">From Consumers to Critical
                Users: Prompty, an AI Literacy Tool For High School Students</a></h3>
        <div style="color:#006621;line-height:18px">DV Dennison, RCC Garcia, P Sarin, J Wolf, C Bywater… - 2024</div>
        <div class="gse_alrt_sni" style="line-height:17px">In an age where Large Language Models (LLMs) expedite the
            generation of text, the <br>skills for critically evaluating and creating meaningful text using these models
            are <br>often lacking. To help classroom teachers address this, we introduce Prompty, a …</div>
        <div style="width:auto">
            <table cellpadding="0" cellspacing="0" border="0">
                <tbody>
                    <tr>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/citations?hl=ja&amp;update_op=email_library_add&amp;info=VtuPNZG9G0cJ&amp;citsig=AM0yFCkAAAAAZ4Epb3ZRPbWcOB863PEnHbqC1-I"
                                style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img
                                    alt="保存" src="https://scholar.google.com/intl/ja/scholar/images/1x/save-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=tw&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Twitter" src="https://scholar.google.com/intl/ja/scholar/images/1x/tw-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=in&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="LinkedIn" src="https://scholar.google.com/intl/ja/scholar/images/1x/in-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=fb&amp;url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;rt=From+Consumers+to+Critical+Users:+Prompty,+an+AI+Literacy+Tool+For+High+School+Students&amp;scisig=AFWwaeZ9LGOYHdsMRUmOHTaK4aKy"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Facebook" src="https://scholar.google.com/intl/ja/scholar/images/1x/fb-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                    </tr>
                </tbody>
            </table>
        </div><br>
        <h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><span
                style="font-size:13px;font-weight:normal;color:#1a0dab;vertical-align:2px">[PDF]</span> <a
                href="https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023/eaai-2023.pdf&amp;hl=ja&amp;sa=X&amp;d=10550266781103192753&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeaD4xI6bXDczdKSe8l4MBjd&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=1&amp;folt=art"
                class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">Co-designing AI Education
                Curriculum with Cross-Disciplinary High School Teachers</a></h3>
        <div style="color:#006621;line-height:18px">B Xie, P Sarin, J Wolf, RCC Garcia, V Delaney, I Sieh… - 2024</div>
        <div class="gse_alrt_sni" style="line-height:17px">High school teachers from many disciplines have growing
            interests in teaching about <br>artificial intelligence (AI). This cross-disciplinary interest reflects the
            prevalence of AI <br>tools across society, such as Generative AI tools built upon Large Language Models …</div>
        <div style="width:auto">
            <table cellpadding="0" cellspacing="0" border="0">
                <tbody>
                    <tr>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/citations?hl=ja&amp;update_op=email_library_add&amp;info=sXpCXb0TapIJ&amp;citsig=AM0yFCkAAAAAZ4Epb_Z-LNOVyO0R7fPIS_cwH_k"
                                style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img
                                    alt="保存" src="https://scholar.google.com/intl/ja/scholar/images/1x/save-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=tw&amp;url=https://www.benjixie.com/publication/eaai-2023/eaai-2023.pdf&amp;rt=Co-designing+AI+Education+Curriculum+with+Cross-Disciplinary+High+School+Teachers&amp;scisig=AFWwaebloFtJ1IZgVYoZY0YZeSU1"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Twitter" src="https://scholar.google.com/intl/ja/scholar/images/1x/tw-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=in&amp;url=https://www.benjixie.com/publication/eaai-2023/eaai-2023.pdf&amp;rt=Co-designing+AI+Education+Curriculum+with+Cross-Disciplinary+High+School+Teachers&amp;scisig=AFWwaebloFtJ1IZgVYoZY0YZeSU1"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="LinkedIn" src="https://scholar.google.com/intl/ja/scholar/images/1x/in-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                        <td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a
                                href="https://scholar.google.com/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=fb&amp;url=https://www.benjixie.com/publication/eaai-2023/eaai-2023.pdf&amp;rt=Co-designing+AI+Education+Curriculum+with+Cross-Disciplinary+High+School+Teachers&amp;scisig=AFWwaebloFtJ1IZgVYoZY0YZeSU1"
                                style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img
                                    alt="Facebook" src="https://scholar.google.com/intl/ja/scholar/images/1x/fb-32.png"
                                    border="0" height="16" width="16" style="vertical-align:top"></a></td>
                    </tr>
                </tbody>
            </table>
        </div><br>`.replace(/[\r\n ]+/g, " ");

const citationAlertEmail = `
<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><style>body{background-color:#fff}.gse_alrt_title{text-decoration:none}.gse_alrt_title:hover{text-decoration:underline} @media screen and (max-width: 599px) {.gse_alrt_sni br{display:none;}}</style></head><body><!--[if gte mso 9]><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:600px"><![endif]--><div style="font-family:arial,sans-serif;font-size:13px;line-height:16px;color:#222;width:100%;max-width:600px"><h3 style="font-weight:lighter;font-size:18px;line-height:20px;"></h3><h3 style="font-weight:normal;font-size:18px;line-height:20px;"></h3><h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><span style="font-size:11px;font-weight:bold;color:#1a0dab;vertical-align:2px">[PDF]</span> <a href="https://scholar.google.com/scholar_url?url=https://drpress.org/ojs/index.php/ajst/article/download/15450/14986&amp;hl=en&amp;sa=X&amp;d=2361859649660102863&amp;ei=WSSWZc20JLqI6rQP9eWBqAc&amp;scisig=AFWwaeYOy3GXd6C5fG39keSjDd82&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:4346413331817775246:AFWwaeY8qfiUNbR1wcWCEWAgeRCs&amp;html=&amp;pos=0&amp;folt=cit" class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">InkFusion3D: 3D Printing Flexible Sensors with Silicone Rubber and Conductive Ink Materials</a></h3><div style="color:#006621;line-height:18px">J Xu - Academic Journal of Science and Technology, 2023</div><div class="gse_alrt_sni" style="line-height:17px">With the continuous advancement in current sensor design research, most design <br>schemes still rely on rigid or semi-flexible materials for sensor usage. These <br>interactive devices are increasingly unable to meet the demands of users for <br>adaptability, durability, and biocompatibility, limiting their use in dynamic <br>environments. This paper introduces a novel flexible sensor, InkFusion3D, which is <br>fabricated using a combination of low-cost conductive ink and silicone rubber …</div><table cellpadding="0" cellspacing="0" border="0" style="padding:8px 0"><tr><td style="line-height:18px;font-size:15px;padding-right:8px;" valign="top">•</td><td style="line-height:18px;font-size:15px;mso-padding-alt:8px 0 4px 0;"><span style="mso-text-raise:4px;">Cites: ‪FlexBoard: A Flexible Breadboard for Interaction Prototyping on …‬&nbsp;&nbsp;</span></td></tr></table><div style="width:auto"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.com/citations?hl=en&amp;update_op=email_library_add&amp;info=z6hRc9YCxyAJ&amp;citsig=AM0yFCkAAAAAZ3dX2T1ee3tfAmQYn_cLCS1f1FA&amp;cited-by=" style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img alt="Save" src="https://scholar.google.com/intl/en/scholar/images/1x/save-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.com/scholar_share?hl=en&amp;oi=scholaralrt&amp;ss=tw&amp;url=https://drpress.org/ojs/index.php/ajst/article/download/15450/14986&amp;rt=InkFusion3D:+3D+Printing+Flexible+Sensors+with+Silicone+Rubber+and+Conductive+Ink+Materials&amp;scisig=AFWwaeZf0aIUm5ztF0QQrttxlt2I" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="Twitter" src="https://scholar.google.com/intl/en/scholar/images/1x/tw-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.com/scholar_share?hl=en&amp;oi=scholaralrt&amp;ss=in&amp;url=https://drpress.org/ojs/index.php/ajst/article/download/15450/14986&amp;rt=InkFusion3D:+3D+Printing+Flexible+Sensors+with+Silicone+Rubber+and+Conductive+Ink+Materials&amp;scisig=AFWwaeZf0aIUm5ztF0QQrttxlt2I" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="LinkedIn" src="https://scholar.google.com/intl/en/scholar/images/1x/in-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.com/scholar_share?hl=en&amp;oi=scholaralrt&amp;ss=fb&amp;url=https://drpress.org/ojs/index.php/ajst/article/download/15450/14986&amp;rt=InkFusion3D:+3D+Printing+Flexible+Sensors+with+Silicone+Rubber+and+Conductive+Ink+Materials&amp;scisig=AFWwaeZf0aIUm5ztF0QQrttxlt2I" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="Facebook" src="https://scholar.google.com/intl/en/scholar/images/1x/fb-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td></tr></tbody></table></div><br><div style="line-height:16px;mso-line-height-rule:exactly;border-top:1px solid #bdbdbd">&nbsp;</div><p style="margin:8px 0 16px 0;color:#666">This message was sent by Google Scholar because you're following new citations to articles written by <a href="https://scholar.google.com/citations?hl=en&amp;user=sxLy7IwAAAAJ" style="color:#1a0dab;">Yoonji Kim</a>.<img src="https://scholar.google.com/scholar_url?url=https://scholar.google.com/scholar/images/cleardot.gif&amp;hl=en&amp;sa=X&amp;ei=WSSWZc20JLqI6rQP9eWBqAc&amp;scisig=AFWwaeaD7BBaOOzddxOwf5MdddkY&amp;hist=67TkyOwAAAAJ:4346413331817775246:AFWwaeY8qfiUNbR1wcWCEWAgeRCs&amp;html=&amp;folt=cit&amp;lrrs=0" height=1 width=1 alt=""></p><div style="margin-bottom:8px;"><div><!--[if gte mso 9]><table border="0" cellspacing="0" cellpadding="0"><tr><td style="mso-line-height-rule:exactly;line-height:27px;border-top:1px solid #fff;border-bottom:1px solid #fff;mso-text-raise:-1px;"><![endif]--><a href="https://scholar.google.com/scholar_alerts?view_op=list_alerts&amp;email_for_op=yuchi.yahagi%40gmail.com&amp;alert_id=jkAFouWPUTwJ&amp;hl=en" style="display:inline-block;text-decoration:none;font-family:arial,sans-serif;font-size:13px;font-size:11px;text-transform:uppercase;font-size:13px;line-height:21px;padding:3px 0;color:#1a0dab;border-top:1px solid transparent;border-bottom:1px solid transparent;border-radius:3px;mso-padding-alt:0;mso-border-alt:none;"><span style="mso-text-raise:5px">List alerts</span></a><!--[if gte mso 9]></td></tr></table><![endif]--></div><div><!--[if gte mso 9]><table border="0" cellspacing="0" cellpadding="0"><tr><td style="mso-line-height-rule:exactly;line-height:27px;border-top:1px solid #fff;border-bottom:1px solid #fff;mso-text-raise:-1px;"><![endif]--><a href="https://scholar.google.com/scholar_alerts?view_op=cancel_alert_options&amp;email_for_op=yuchi.yahagi%40gmail.com&amp;alert_id=jkAFouWPUTwJ&amp;hl=en&amp;citsig=AM0yFCkAAAAAZaiZWamByjUilhax-751T2CqNKg" style="display:inline-block;text-decoration:none;font-family:arial,sans-serif;font-size:13px;font-size:11px;text-transform:uppercase;font-size:13px;line-height:21px;padding:3px 0;color:#1a0dab;border-top:1px solid transparent;border-bottom:1px solid transparent;border-radius:3px;mso-padding-alt:0;mso-border-alt:none;"><span style="mso-text-raise:5px">Cancel alert</span></a><!--[if gte mso 9]></td></tr></table><![endif]--></div></div></div><!--[if gte mso 9]></td></tr></table><![endif]--></body></html>
`;

const citationAlertEmail2 = `
<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><style>body{background-color:#fff}.gse_alrt_title{text-decoration:none}.gse_alrt_title:hover{text-decoration:underline} @media screen and (max-width: 599px) {.gse_alrt_sni br{display:none;}}</style></head><body><!--[if gte mso 9]><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:600px"><![endif]--><div style="font-family:arial,sans-serif;font-size:13px;line-height:16px;color:#222;width:100%;max-width:600px"><h3 style="font-weight:lighter;font-size:18px;line-height:20px;"></h3><h3 style="font-weight:normal;font-size:18px;line-height:20px;"></h3><h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><a href="https://scholar.google.co.jp/scholar_url?url=https://dl.acm.org/doi/abs/10.1145/3610541.3614568&amp;hl=ja&amp;sa=X&amp;d=10431752061266847390&amp;ei=Oj9mZZDGPL2F6rQP9fy32Ak&amp;scisig=AFWwaeYGEqCupL2bB0b82oK8sKIx&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:6499232596105771955:AFWwaeaIQ-7AfxNyqJ0tapdWCiVx&amp;html=&amp;pos=0&amp;folt=cit&amp;fols=" class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">AiRound: a touchable mid-air image viewable from 360 degrees</a></h3><div style="color:#006621;line-height:18px">Y Yano, N Koizumi - SIGGRAPH Asia 2023 Emerging Technologies, 2023</div><div class="gse_alrt_sni" style="line-height:17px">In this paper, we describe AiRound, an optical system that displays mid-air images <br>that can be viewed from any direction. Mid-air images are touchable floating images <br>formed by retroreflective transmissive optical elements that can seamlessly connect <br>the virtual world to real space without special equipment. However, they are limited <br>by three problems, including a limited range of observation, the visibility of the light <br>source from the outside, and the aesthetically displeasing of stray light. The …</div><table cellpadding="0" cellspacing="0" border="0" style="padding:8px 0"><tr><td style="line-height:18px;font-size:15px;padding-right:8px;" valign="top">•</td><td style="line-height:18px;font-size:15px;mso-padding-alt:8px 0 4px 0;"><span style="background-color:#1A73E8;border-radius:3px;font-size:13px;color:#fff;padding:0 8px;margin-right:8px;display:inline-block;vertical-align:top;mso-text-raise:4px;"><!--[if gte mso 9]>&nbsp;&nbsp;<![endif]-->1 件目の引用<!--[if gte mso 9]>&nbsp;&nbsp;<![endif]--></span><!--[if gte mso 9]>&nbsp;&nbsp;<![endif]--><span style="mso-text-raise:4px;">‪ReQTable: Square tabletop display that provides …‬&nbsp;&nbsp;</span><a href="https://scholar.google.co.jp/citations?hl=ja&amp;user=67TkyOwAAAAJ#d=gs_md_cita-d&amp;u=/citations%3Fview_op%3Dview_citation%26user%3D67TkyOwAAAAJ%26citation_for_view%3D67TkyOwAAAAJ:W7OEmFMy1HYC%26hl%3Dja" style="padding:8px 0;"><img height="18" width="21" alt="編集" style="vertical-align:top;" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/link-36.png"></a></td></tr></table><div style="width:auto"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/citations?hl=ja&amp;update_op=email_library_add&amp;info=nmbC3DoHxZAJ&amp;citsig=AM0yFCkAAAAAZ0dyu6QEjlzZqKPlOfd-VB_NeaA&amp;cited-by=" style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img alt="保存" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/save-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=tw&amp;url=https://dl.acm.org/doi/abs/10.1145/3610541.3614568&amp;rt=AiRound:+a+touchable+mid-air+image+viewable+from+360+degrees&amp;scisig=AFWwaebtt4IP6dZrMtxtgNxVzlVk" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="Twitter" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/tw-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=in&amp;url=https://dl.acm.org/doi/abs/10.1145/3610541.3614568&amp;rt=AiRound:+a+touchable+mid-air+image+viewable+from+360+degrees&amp;scisig=AFWwaebtt4IP6dZrMtxtgNxVzlVk" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="LinkedIn" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/in-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/scholar_share?hl=ja&amp;oi=scholaralrt&amp;ss=fb&amp;url=https://dl.acm.org/doi/abs/10.1145/3610541.3614568&amp;rt=AiRound:+a+touchable+mid-air+image+viewable+from+360+degrees&amp;scisig=AFWwaebtt4IP6dZrMtxtgNxVzlVk" style="text-decoration:none;display:inline-block;padding:4px 8px;mso-padding-alt:0;"><img alt="Facebook" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/fb-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td></tr></tbody></table></div><br><h3 style="font-weight:normal;margin:0;font-size:17px;line-height:20px;"><a href="https://scholar.google.co.jp/scholar_url?url=https://dl.acm.org/doi/abs/10.1145/3623263.3623361&amp;hl=ja&amp;sa=X&amp;d=940654516137155503&amp;ei=Oj9mZZDGPL2F6rQP9fy32Ak&amp;scisig=AFWwaeZaZjm82qCMWV8L4KykDrp6&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:6499232596105771955:AFWwaeaIQ-7AfxNyqJ0tapdWCiVx&amp;html=&amp;pos=1&amp;folt=cit&amp;fols=" class="gse_alrt_title" style="font-size:17px;color:#1a0dab;line-height:22px">LattiSense: A 3D-Printable Resistive Deformation Sensor with Lattice Structures</a></h3><div style="color:#006621;line-height:18px">R Sakura, C Han, Y Lyu, K Watanabe, R Yamamura… - Proceedings of the 8th ACM …, 2023</div><div class="gse_alrt_sni" style="line-height:17px">Recently, soft and deformable materials have become popular as sensors for their <br>applicability in daily objects. Although studies have been conducted on existing <br>conductive soft materials, problems such as a lack of design freedom regarding <br>softness, shape, and deformation, as well as wiring complexity remain. Here, we <br>propose a novel soft sensor called LattiSense, fabricated using an FDM 3D printer. <br>By arranging conductive and non-conductive flexible filaments in a lattice structure …</div><table cellpadding="0" cellspacing="0" border="0" style="padding:8px 0"><tr><td style="line-height:18px;font-size:15px;padding-right:8px;" valign="top">•</td><td style="line-height:18px;font-size:15px;mso-padding-alt:8px 0 4px 0;"><span style="mso-text-raise:4px;">引用: ‪3D Printing Firm Inflatables with Internal Tethers‬&nbsp;&nbsp;</span><a href="https://scholar.google.co.jp/citations?hl=ja&amp;user=67TkyOwAAAAJ#d=gs_md_cita-d&amp;u=/citations%3Fview_op%3Dview_citation%26user%3D67TkyOwAAAAJ%26citation_for_view%3D67TkyOwAAAAJ:UeHWp8X0CEIC%26hl%3Dja" style="padding:8px 0;"><img height="18" width="21" alt="編集" style="vertical-align:top;" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/link-36.png"></a></td></tr></table><div style="width:auto"><table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/citations?hl=ja&amp;update_op=email_library_add&amp;info=r9u4ckzgDQ0J&amp;citsig=AM0yFCkAAAAAZ0dyu3_AbzVHHWYRjZ4Xsyp8pxo&amp;cited-by=" style="text-decoration:none;display:inline-block;padding:4px 8px 4px 0;mso-padding-alt:0;"><img alt="保存" src="https://scholar.google.co.jp/intl/ja/scholar/images/1x/save-32.png" border="0" height="16" width="16" style="vertical-align:top"></a></td><td style="padding-right:4px;mso-padding-alt:4px 16px 0 0;"><a href="https://scholar.google.co.jp/scholar_s`

function testExtractTitlesFromHTML() {
  // Test cases for extractInnerTextFromHTML
  const testCasesInnerText = [
    {
      html: `<h3><a class="gse_alrt_title">First Link</a></h3><h3><a>Second Link</a></h3>`,
      expected: ["First Link", "Second Link"],
      testName: "Test extractInnerTextFromHTML with multiple links"
    },
    {
      html: `<h3><a class="gse_alrt_title">Single Link</a></h3>`,
      expected: ["Single Link"],
      testName: "Test extractInnerTextFromHTML with single link"
    },
    {
      html: `<h3><span>Foo</span><a href="https://scholar.google.com/">Link 1</a></h3><h3><a href="https://scholar.google.com/" style="font-weight:normal;margin:0;font-size:17px;line-height:20px;" class="gse_alrt_title">Link 2</a></h3><h3><a href="https://scholar.google.com/" class="gse_alrt_title">Link 3</a><span>Bar</span></h3>`,
      expected: ["Link 1", "Link 2", "Link 3"],
      testName: "Test extractInnerTextFromHTML with three links"
    },
    {
      html: ScholarAlertMailSingle,
      expected: ["From Consumers to Critical Users: Prompty, an AI Literacy Tool For High School Students"],
      testName: "Google Scholar Alert Single Title"
    },
    {
      html: ScholarAlertMail2,
      expected: ["From Consumers to Critical Users: Prompty, an AI Literacy Tool For High School Students", "Co-designing AI Education Curriculum with Cross-Disciplinary High School Teachers"],
      testName: "Google Scholar Alert Single Title2"
    }
  ];

  for (const testCase of testCasesInnerText) {
    const innerTextResult = extractPaperTitlesFromHTML(testCase.html);
    assertEqual(innerTextResult, testCase.expected, testCase.testName);
  }

  console.log("All tests passed!");
}

function testExtractHrefFromHTML() {
  // Test cases for extractHrefFromHTML
  const testCasesHref = [
    {
      html: `<h3><a href="https://example.com" class="gse_alrt_title">Link 1</a></h3><h3><a href="https://example2.com" class="gse_alrt_title">Link 2</a></h3>`,
      expected: ["https://example.com", "https://example2.com"],
      testName: "Test extractHrefFromHTML with multiple links"
    },
    {
      html: `<h3><a href="https://example.com">Single Link</a></h3>`,
      expected: ["https://example.com"],
      testName: "Test extractHrefFromHTML with single link"
    },
    {
      html: `<h3><a href="https://link1.com" class="gse_alrt_title">Link 1</a></h3><h3><a href="https://link2.com">Link 2</a></h3><h3><a href="https://link3.com" class="gse_alrt_title">Link 3</a></h3>`,
      expected: ["https://link1.com", "https://link2.com", "https://link3.com"],
      testName: "Test extractHrefFromHTML with three links"
    },
    {
      html: ScholarAlertMailSingle,
      expected: ["https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;hl=ja&amp;sa=X&amp;d=5123897432430598998&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeZFN1NuM-e3vwW4W5QTHZ5R&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=0&amp;folt=art"],
      testName: "Test Sholar Alert Email"
    },
    {
      html: ScholarAlertMail2,
      expected: ["https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023b/eaai-2023b.pdf&amp;hl=ja&amp;sa=X&amp;d=5123897432430598998&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeZFN1NuM-e3vwW4W5QTHZ5R&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=0&amp;folt=art", "https://scholar.google.com/scholar_url?url=https://www.benjixie.com/publication/eaai-2023/eaai-2023.pdf&amp;hl=ja&amp;sa=X&amp;d=10550266781103192753&amp;ei=7_WfZfmdFKGz6rQP9Z-1qAg&amp;scisig=AFWwaeaD4xI6bXDczdKSe8l4MBjd&amp;oi=scholaralrt&amp;hist=67TkyOwAAAAJ:2506725668801333366:AFWwaeZFgXeGD_gvdTuzvkqw5E1r&amp;html=&amp;pos=1&amp;folt=art"],
      testName: "Test Sholar Alert Email2"
    }
  ];

  for (const testCase of testCasesHref) {
    const hrefResult = extractURLFromHTML(testCase.html);
    assertEqual(hrefResult, testCase.expected, testCase.testName);
  }

  console.log("All tests passed!");
}

function testExtractH3FollowingSiblingDiv1() {
  // Test cases for extractHrefFromHTML
  const testCasesDiv1 = [
    {
      html: `<h3><a href="https://example.com" class="gse_alrt_title">Link 1</a></h3><div>Text1</div><div>Text2</div><h3><a href="https://example2.com" class="gse_alrt_title">Link 2</a></h3><div>Text3</div><div>Text4</div>`,
      expected: ["Text1", "Text3"],
      testName: "Test1"
    },
    {
      html: ScholarAlertMailSingle,
      expected: ["DV Dennison, RCC Garcia, P Sarin, J Wolf, C Bywater… - 2024"],
      testName: "Test Sholar Alert Email"
    },
    {
      html: ScholarAlertMail2,
      expected: ["DV Dennison, RCC Garcia, P Sarin, J Wolf, C Bywater… - 2024", "B Xie, P Sarin, J Wolf, RCC Garcia, V Delaney, I Sieh… - 2024"],
      testName: "Test Sholar Alert Email2"
    }
  ];

  for (const testCase of testCasesDiv1) {
    const div1Result = extractH3FollowingSiblingDiv1(testCase.html);
    assertEqual(div1Result, testCase.expected, testCase.testName);
  }

  console.log("All tests passed!");
}


function testExtractH3FollowingSiblingDiv2() {
  // Test cases for extractHrefFromHTML
  const testCasesDiv2 = [
    {
      html: `<h3><a href="https://example.com" class="gse_alrt_title">Link 1</a></h3><div>Text1</div><div>Text2</div><h3><a href="https://example2.com" class="gse_alrt_title">Link 2</a></h3><div>Text3</div><div>Text4</div>`,
      expected: ["Text2", "Text4"],
      testName: "Test1"
    },
    {
      html: ScholarAlertMailSingle,
      expected: ["In an age where Large Language Models (LLMs) expedite the generation of text, the <br>skills for critically evaluating and creating meaningful text using these models are <br>often lacking. To help classroom teachers address this, we introduce Prompty, a …"],
      testName: "Test Sholar Alert Email"
    },
    {
      html: ScholarAlertMail2,
      expected: ["In an age where Large Language Models (LLMs) expedite the generation of text, the <br>skills for critically evaluating and creating meaningful text using these models are <br>often lacking. To help classroom teachers address this, we introduce Prompty, a …", "High school teachers from many disciplines have growing interests in teaching about <br>artificial intelligence (AI). This cross-disciplinary interest reflects the prevalence of AI <br>tools across society, such as Generative AI tools built upon Large Language Models …"],
      testName: "Test Sholar Alert Email2"
    }
  ];

  for (const testCase of testCasesDiv2) {
    const div2Result = extractH3FollowingSiblingDiv2(testCase.html);
    assertEqual(div2Result, testCase.expected, testCase.testName);
  }

  console.log("All tests passed!");
}


function testExtractCitedPapers() {
  // Test cases for extractHrefFromHTML
  const testCasesCitedPapers = [
    {
      html: citationAlertEmail,
      expected: ["FlexBoard: A Flexible Breadboard for Interaction Prototyping on …"],
      testName: "Test1"
    },
    {
      html: citationAlertEmail2,
      expected: ["ReQTable: Square tabletop display that provides …", "3D Printing Firm Inflatables with Internal Tethers"],
      testName: "Test2"
    },
  ];

  for (const testCase of testCasesCitedPapers) {
    const citedPapersResult = extractCitedPapers(testCase.html);
    assertEqual(citedPapersResult, testCase.expected, testCase.testName);
  }

  console.log("All tests passed!");
}

