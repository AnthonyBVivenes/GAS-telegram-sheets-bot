/**
 * GAS-telegram-sheets-bot - Linker Utility
 * Use this file to manually trigger the webhook connection.
 */



/**
 * Run this function manually in the Apps Script editor 
 * to link your bot with this script.
 */
function initializeWebhook() {
  try {
    var response = setBotWebhook(BOT_TOKEN, WEB_APP_URL);
    var result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      Logger.log("Success: Webhook set correctly!");
      Logger.log("Message: " + result.description);
    } else {
      Logger.log("Error: Webhook failed.");
      Logger.log("Code: " + result.error_code + " - " + result.description);
    }
  } catch (e) {
    Logger.log("Critical Error: " + e.toString());
  }
}