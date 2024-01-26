function main() {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay(); // 0: 日曜日, 1: 月曜日, 2: 火曜日, ..., 6: 土曜日

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("It's weekend! Skip alert.")
    return; // 土曜日か日曜日なら関数の実行を終了
  }

  // 特定のラベルの未読メッセージを取得
  const scriptProperties = PropertiesService.getScriptProperties();
  const label = scriptProperties.getProperty('GMAIL_LABEL');
  let unreadMessages = getUnreadMessagesByLabel(label);

  const { status, processedMessages, uniqTitles } = aggregatePapersFromMessages(unreadMessages);
  console.log(JSON.stringify(status));

  sendToSlack(uniqTitles, status);

  markMessagesAsRead(processedMessages);
}
