# Google Apps Script 用 Scholar Alert 集約スクリプト

[English README is here](README.md)

## 概要

このリポジトリは、Alexander Bezzubov 氏による Go ベースのプロジェクト [bzz/scholar-alert-digest](https://github.com/bzz/scholar-alert-digest) を Google Apps Script で動作するように JavaScript に移植したものです。この移植の目的は、Google Scholar のアラートメールを一つのダイジェストにまとめ、さらに Slack への投稿機能を追加することで、アラートの確認プロセスを効率化することです。

## 目的

複数の Google Scholar アラートメールをまとめて整理し、単一のレポートとして Slack に投稿することで、アラートの確認作業を軽減します。

## 主な機能

- **アラートの集約**: Google Scholar アラートメールから情報を収集し、一つのレポートにまとめます。
- **アラート数による並べ替え**: 収集した文献情報をアラート数によって並べ替えます。
- **Slack 連携**: 並べ替えて集約したアラートを Slack に投稿できます。
- **_保存_ボタン**: クリック一つで論文データをノートアプリケーションに保存できます。
- **プロキシ対応**: 所属組織を通じて論文にアクセスするためのプロキシ URL を追加できます。

<img width="400" alt="Screenshot 2025-04-20 at 15 55 06" src="https://github.com/user-attachments/assets/4eb5c023-02e7-4368-8a6f-2513c3663488" />

## 前提条件

- Google Scholar アラートが Gmail に届くように設定されており、このスクリプト（Google Apps Script）は同じ Google アカウントで実行する必要があります。
  - Google Scholar アラートメールには特定のラベル（例：Google Scholar）を付けてください。
- スクリプトは、Gmail で Scholar アラートを受信する Google アカウントと同じアカウントで作成する必要があります。
- アラートの送信先となる Slack ワークスペースに、独自の Slack アプリがインストールされている必要があります。
  - Slack トークンとアラートの投稿先 Slack チャンネルの ID が必要です。
  - Slack アプリに chat:write 権限があることを確認してください。
  - Slack トークンの取得方法は、公式チュートリアルを参照してください：https://api.slack.com/tutorials/tracks/getting-a-token
- clasp を使用する場合は、ローカルマシンに nodejs がインストールされている必要があります。

## 使用方法

### Google Apps Script プロジェクトの作成とスクリプトのアップロード

```sh
# リポジトリをクローン
git clone https://github.com/FlechaMaker/scholar-alert-digest-js.git
cd scholar-alert-digest-js

# clasp をインストールして Google にログイン
npm install -g @google/clasp
clasp login  # Scholar アラートを受信するのと同じ Google アカウントでログインしてください！

# 新しい Google Apps Script プロジェクトを作成
clasp create --type standalone --title "Scholar Alert Digest"

# スクリプトを Google Apps Script プロジェクトにアップロード
clasp push

# Google Apps Script プロジェクトを開いて以下の設定を続ける
clasp open
```

または、JavaScript ファイル（.js）を手動で Google Apps Script プロジェクトにコピー＆ペーストすることもできます。

### スクリプトプロパティの設定

Google Apps Script の設定で以下のスクリプトプロパティを設定します。

#### Gmail

| プロパティ名   | 必須？ | 説明                                          | 例            |
| ------------- | ------ | --------------------------------------------- | ------------- |
| `GMAIL_LABEL` | はい    | Google Scholar アラート用の Gmail ラベル。     | Google Scholar |

#### Slack

| プロパティ名             | 必須？ | 説明                                         | 例           |
| ----------------------- | ------ | ------------------------------------------- | ------------ |
| `SLACK_TOKEN`           | はい    | 認証用の Slack トークン。                     | xoxb-00000... |
| `SLACK_CONVERSATION_ID` | はい    | アラートが投稿される Slack チャンネルの ID。   | C000000000000 |

#### プロキシ

| プロパティ名            | 必須？ | 説明                                            | 例                                     |
| ---------------------- | ------ | ---------------------------------------------- | -------------------------------------- |
| `PROXY_URL`            | いいえ  | 所属組織を通じて論文にアクセスするためのプロキシ URL。 | https://utokyo.idm.oclc.org/login?url= |
| `PROXY_IGNORE_DOMAINS` | いいえ  | プロキシを無視するドメインのスペース区切りリスト。   | arxiv.org dl.acm.org                   |

#### Obsidian

| プロパティ名            | 必須？ | 説明                                                      | 例        |
| ---------------------- | ------ | -------------------------------------------------------- | --------- |
| `OBSIDIAN_VAULT`       | いいえ  | 論文ノートを保存する Obsidian の保管庫名。                   | My vault  |
| `OBSIDIAN_FOLDER_PATH` | いいえ  | 論文ノートを保存する Obsidian のフォルダパス。ルートディレクトリに保存する場合は "/" を設定。 | Articles |

#### Scrapbox

| プロパティ名     | 必須？ | 説明                                   | 例         |
| --------------- | ------ | ------------------------------------- | ---------- |
| `SCRAPBOX_NAME` | いいえ  | 論文ノートを保存する Scrapbox のプロジェクト名。 | My project |

### 使用方法

使用例については `main.js` を参照してください。アラートを集約して投稿するには `main` 関数を実行します。
最新のアラートを定期的に受け取るようにスクリプトをスケジュールすることができます。Google Apps Script プロジェクトのインターフェースで `main` を実行するトリガーを作成してください。

## 謝辞

Scholar Alert Digest の Go ベースの実装を提供してくださった Alexander Bezzubov 氏に特別な感謝を表します。この JavaScript への移植は、彼の作業をベースにして Slack 連携などの追加機能を実装しています。
