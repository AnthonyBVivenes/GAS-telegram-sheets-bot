/**
 * GAS-telegram-sheets-bot - Core Engine
 * Copyright 2026 Anthony Vivenes
 * Licensed under the Apache License, Version 2.0
 */

// --- NETWORK CONFIGURATION ---

/**
 * Sends a request to the Telegram Bot API.
 * @param {string} token - Bot Token.
 * @param {string} method - Telegram method (e.g., "sendMessage").
 * @param {Object} payload - Data object to send.
 */
function postToTelegram(token, method, payload) {
  var url = "https://api.telegram.org/bot" + token + "/" + method;
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  return UrlFetchApp.fetch(url, options);
}

