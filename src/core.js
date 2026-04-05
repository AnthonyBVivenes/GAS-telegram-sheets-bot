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

// --- DATABASE FUNCTIONS (SHEETS) ---

/**
 * Finds a value in a specific column and returns the row index (1-based).
 * @param {string} ssId - Google Sheets document ID
 * @param {string} sheetName - Name of the sheet to search
 * @param {number} columnIndex - Column index (0-based)
 * @param {string|number} searchValue - Value to search for
 * @returns {number} Row index (1-based) or -1 if not found
 */
function findRowByValue(ssId, sheetName, columnIndex, searchValue) {
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][columnIndex] == searchValue) return i + 1;
  }
  return -1;
}
