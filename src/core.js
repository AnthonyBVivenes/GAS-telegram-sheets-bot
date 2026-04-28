/**
 * GAS-telegram-sheets-bot - Core Engine
 * @version 1.0.0
 * @author Anthony B. Vivenes
 * @license Apache 2.0
 * @description Bot engine for Telegram integration with Google Sheets
 * @see https://github.com/AnthonyBVivenes/GAS-telegram-sheets-bot
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
function findRowByValue(spreadsheetId, sheetName, columnNumber, value) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return -1;
  
  var data = sheet.getDataRange().getValues();
  var searchValue = value ? value.toString().trim() : "";

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row && row.length >= columnNumber) {
      var cellValue = row[columnNumber - 1];
      
      var cellString = (cellValue !== null && cellValue !== undefined) ? cellValue.toString().trim() : "";
      
      if (cellString === searchValue) {
        return i + 1;
      }
    }
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
 * Standardized logging system.
 * Appends system events or errors to the logs sheet.
 * * @param {string} ssId - The Spreadsheet ID.
 * @param {string} type - Log level (e.g., INFO, ERROR, UNAUTHORIZED).
 * @param {string} description - Detailed message of the event.
 */
function writeLog(ssId, type, description) {
  try {
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheetByName(SHEET_LOGS);
    
    if (!sheet) return; // Silent fail if log sheet is missing to avoid execution loops

    // Standard timestamp for technical audits
    const timestamp = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:mm:ss");
    
    // Schema: [Timestamp, Type, Message]
    sheet.appendRow([timestamp, type, description]);
  } catch (e) {
    console.error("Critical failure in writeLog: " + e.toString());
  }
}

// --- SECURITY UTILITIES ---



/**
 * Checks if a user is an administrator.
 * Based on DATABASE_SCHEMA: the "admins" sheet has "chat_id" at index 0 (Column A).
 * * @param {string} ssId - Spreadsheet ID.
 * @param {number|string} chatId - Telegram User ID.
 * @returns {boolean}
 */
function isAdmin(ssId, chatId) {
  return findRowByValue(ssId, "admins", 0, chatId) !== -1;
}




// --- LINKER INIT ---

/**
 * Sets the webhook for the Telegram bot to point to this script's URL.
 * @param {string} token - Bot Token.
 * @param {string} url - The Web App URL from Google Apps Script deployment.
 * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse} The API response.
 */
function setBotWebhook(token, url) {
  var payload = {
    url: url
  };
  return postToTelegram(token, "setWebhook", payload);
}


/**
 * Calculates the maximum ID in a column and returns maximum + 1.
 * @returns {number} New AI ID.
 */
function generateAutoId(sheetName, columnIndex) {
  try {

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return 1;

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 1;

    
    var ids = sheet.getRange(2, columnIndex + 1, lastRow - 1, 1).getValues();
    
    
    var maxId = Math.max.apply(null, ids.map(function(row) { 
      var val = parseInt(row[0]);
      return isNaN(val) ? 0 : val; 
    }));

    return maxId + 1;
  } catch (e) {
    return 1;
  }
}

/**
* Formats a Date object to string DD/MM/YYYY HH:MM.
 * @returns {string} Fecha formateada.
 */
function formatDateTime(datetime) {
  return Utilities.formatDate(new Date(datetime), "GMT-4", "dd/MM/yyyy HH:mm");
}



