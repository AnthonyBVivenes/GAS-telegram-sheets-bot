/**
 * Creates a scheduled alert for an event in the "notificador" sheet.
 * @param {number} eventId - The ID of the event.
 * @param {Date|string} scheduledDatetime - Date and time to send the alert.
 * @param {string} alertMessage - The message text.
 * @returns {Object} Result of the operation.
 */
function createScheduledAlert(eventId, scheduledDatetime, alertMessage) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NOTIFIER);
    var alertId = generateAutoId(SHEET_NOTIFIER, 0);
    sheet.appendRow([alertId, eventId, scheduledDatetime, alertMessage, false]);
    return { success: true, message: "Alert scheduled successfully", alertId: alertId };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}


/**
 * Checks for pending alerts and sends them via Telegram.
 * Should be triggered by a time-based trigger.
 */
function checkAndSendPendingAlerts() {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NOTIFIER);
    var data = sheet.getDataRange().getValues();
    var now = new Date();

    for (var i = 1; i < data.length; i++) {
      var alertDate = new Date(data[i][2]);
      var isSent = data[i][4];

      if (isSent === false && alertDate <= now) {
        var subscribers = getEventSubscribers(data[i][1]);
        
        for (var j = 0; j < subscribers.length; j++) {
          postToTelegram(BOT_TOKEN, "sendMessage", { 
            chat_id: subscribers[j], 
            text: "*EVENT NOTIFICATION:*\n" + data[i][3],
            parse_mode: "Markdown"
          });
        }
        // Mark as sent in column 5
        sheet.getRange(i + 1, 5).setValue(true);
        SpreadsheetApp.flush()
      }
    }
  } catch (e) {
    writeLog(SPREADSHEET_ID, "NOTIFICATION_ERROR", e.toString());
  }
}

/**
 * Sends mass messages to specific targets (all, event, group, single).
 * @returns {Object} Result with total sent count.
 */
function sendMessageToRecipients(targetType, targetId, messageText, photoUrl, senderFirstName, senderUsername) {
  try {
    var recipients = [];
    var sentCount = 0;
    var fullText = "*MESSAGE FROM " + senderFirstName + " (@" + senderUsername + "):*\n\n" + messageText;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (targetType === "single") {
      recipients = [targetId];
    } else if (targetType === "all") {
      var users = ss.getSheetByName(SHEET_USERS).getDataRange().getValues();
      for (var i = 1; i < users.length; i++) recipients.push(users[i][3]); // Columna chat_id
    } else if (targetType === "event") {
      recipients = getEventSubscribers(targetId);
    } else if (targetType === "group") {
      
      var members = ss.getSheetByName(SHEET_GROUP_MEMBER).getDataRange().getValues();
      for (var k = 1; k < members.length; k++) { 
        if (members[k][0] == targetId) {
          recipients.push(members[k][1]); 
        }
      }
    }

    for (var m = 0; m < recipients.length; m++) {
      var method = photoUrl ? "sendPhoto" : "sendMessage";
      var payload = { chat_id: recipients[m], parse_mode: "Markdown" };
      
      if (photoUrl) { 
        payload.photo = photoUrl; 
        payload.caption = fullText; 
      } else { 
        payload.text = fullText; 
      }
      
      postToTelegram(BOT_TOKEN, method, payload);
      sentCount++;
    }
    return { success: true, totalSent: sentCount };
  } catch (e) {
    writeLog(SPREADSHEET_ID, "ERROR_MASS_MSG", e.toString());
    return { success: false, message: e.toString() };
  }
}

/**
 * Sends a direct response from an admin to a specific user.
 * @returns {Object} Result status.
 */
function replyToUser(targetChatId, messageText, photoUrl, adminFirstName, adminUsername) {
  try {
    var fullText = "*ADMIN RESPONSE (" + adminFirstName + "):*\n\n" + messageText;
    var method = photoUrl ? "sendPhoto" : "sendMessage";
    var payload = { chat_id: targetChatId, parse_mode: "Markdown" };
    
    if (photoUrl) { 
      payload.photo = photoUrl; 
      payload.caption = fullText; 
    } else { 
      payload.text = fullText; 
    }
    
    postToTelegram(BOT_TOKEN, method, payload);
    return { success: true, message: "Response sent" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}