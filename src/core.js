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

/**
 * Appends a new row to a sheet after basic validation.
 * @param {string} ssId - Google Sheets document ID
 * @param {string} sheetName - Target sheet name
 * @param {Array} dataArray - Array of values to insert
 * @returns {boolean} True if successful, false otherwise
 */
function insertRow(ssId, sheetName, dataArray) {
  if (!dataArray || dataArray.length === 0) return false;
  try {
    var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName);
    sheet.appendRow(dataArray);
    return true;
  } catch (e) {
    writeLog(ssId, "ERROR_INSERT", e.toString());
    return false;
  }
}


// --- MAINTENANCE FUNCTIONS ---

/**
 * Removes duplicate rows based on a specific column index.
 * @param {string} ssId - Google Sheets document ID
 * @param {string} sheetName - Name of the sheet to clean
 * @param {number} columnIndex - Column index to check for duplicates (0-based)
 * @returns {number} Number of duplicates removed
 * @throws {Error} If parameters are invalid
 */
function removeDuplicates(ssId, sheetName, columnIndex) {
  // Validación de parámetros
  if (!ssId || !sheetName || columnIndex === undefined) {
    throw new Error("Missing required parameters");
  }
  
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName);
  if (!sheet) {
    writeLog(ssId, "ERROR", `Sheet "${sheetName}" not found`);
    return 0;
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 0;
  
  var uniqueIds = {};
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var id = data[i][columnIndex];
    if (uniqueIds[id]) {
      rowsToDelete.push(i + 1);
    } else {
      uniqueIds[id] = true;
    }
  }

  // Delete from bottom to top to avoid index shifting
  for (var j = rowsToDelete.length - 1; j >= 0; j--) {
    sheet.deleteRow(rowsToDelete[j]);
  }
  
  if (rowsToDelete.length > 0) {
    writeLog(ssId, "INFO", `Removed ${rowsToDelete.length} duplicates from ${sheetName}`, 
             {columnIndex, removed: rowsToDelete.length});
  }
  
  return rowsToDelete.length;
}


/**
 * Universal logging system.
 * @param {string} ssId - Google Sheets document ID
 * @param {string} type - Log type (e.g., "ERROR", "WARNING", "INFO")
 * @param {string} description - Detailed log message
 * @param {Object} [context] - Optional additional context (user, function, etc.)
 * @returns {boolean} True if log was written successfully
 * 
 * @example
 * writeLog(ssId, "ERROR", "Failed to send message", {userId: 12345, function: "sendMessage"});
 */
function writeLog(ssId, type, description) {
  try {
    var ss = SpreadsheetApp.openById(ssId);
    var sheet = ss.getSheetByName("logs") || ss.insertSheet("logs");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Date", "Type", "Description"]);
    }
    sheet.appendRow([new Intl.DateTimeFormat('es-VE', { 
      dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Caracas' 
    }).format(new Date()), type, description]);
  } catch (e) {
    console.error("Critical log failure: " + e.toString());
  }
}
