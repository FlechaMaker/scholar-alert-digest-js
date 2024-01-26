function getUnreadMessagesByLabel(labelName) {
    let label = GmailApp.getUserLabelByName(labelName);
    if (!label) {
        throw new Error(`Label "${labelName}" not found.`);
    }

    // ラベルに付けられた未読メッセージの総数を取得
    let unreadThreadsCount = label.getUnreadCount();
    let threadsRead = 0;
    let maxThreadsToFetch = 10; // 一度に取得するスレッドの最大数
    let unreadMessages = [];
    let start = 0;

    // すべての未読メッセージを取得するまでループ
    while (threadsRead < unreadThreadsCount) {
        let threads = label.getThreads(start, maxThreadsToFetch);
        for (let thread of threads) {
            if (thread.isUnread()) {
              threadsRead++;

              let messages = thread.getMessages();
              for (let message of messages) {
                  if (message.isUnread()) {
                      unreadMessages.push(message);
                  }
              }
            }          
        }
        start += maxThreadsToFetch;
    }

    return unreadMessages;
}

function markMessagesAsRead(messages) {
    messages.forEach(message => {
        let messageId = message.getId();
        let messageToMarkRead = GmailApp.getMessageById(messageId);
        messageToMarkRead.markRead();
    });
}


function printAllGmailLabels() {
    // Gmailのすべてのラベルを取得
    let labels = GmailApp.getUserLabels();

    // ラベルが存在しない場合
    if (labels.length === 0) {
        console.log("No labels found in Gmail.");
        return;
    }

    // 各ラベルの名前をコンソールに出力
    console.log("Gmail Labels:");
    labels.forEach(label => {
        console.log(label.getName());
    });
}

