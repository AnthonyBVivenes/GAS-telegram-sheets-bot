/**
 * Creates a new event in the "eventos" sheet.
 * @param {string} name - Event name.
 * @param {string} datetime - Event date and time.
 * @param {string} desc - Event description.
 * @param {string} visibility - "public" or "private".
 * @returns {Object} Result with success status and eventId.
 */
function createEvent(name, datetime, desc, visibility) {
  try {
    var eventId = generateAutoId(SHEET_EVENTS, 0);
    var data = [eventId, name, datetime, desc, visibility, new Date()];
    
    var success = insertRow(SPREADSHEET_ID, SHEET_EVENTS, data);
    return { success: success, message: success ? "Event created" : "Insert failed", eventId: eventId };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}



/**
 * Returns a list of public events from the sheet.
 * @returns {string} Formatted list of events.
 */
function fetchPublicEvents() {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_EVENTS);
    var data = sheet.getDataRange().getValues();
    var list = "*PUBLIC EVENTS:*\n\n";
    var found = false;

    for (var i = 1; i < data.length; i++) {
      if (data[i][4] === "public") {
        list += "ID: [" + data[i][0] + "] " + data[i][1] + "\n";
        list += "Date: " + formatDateTime(data[i][2]) + "\n";
        list += "Info: " + data[i][3] + "\n\n";
        found = true;
      }
    }
    return found ? list : "No public events available.";
  } catch (e) {
    return "Error fetching events.";
  }
}

/**
 * Subscribes a user to an event if not already subscribed.
 * @param {number} eventId - The ID of the event.
 * @param {number|string} chatId - The user's chat ID.
 * @returns {Object} Result of the operation.
 */
function subscribeUserToEvent(eventId, chatId) {
  try {
    var eventRow = findRowByValue(SPREADSHEET_ID, SHEET_EVENTS, 0, eventId);
    if (eventRow === -1) {
      return { success: false, message: "El evento no existe." };
    }

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_EVENT_USER);
    var lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < existingData.length; i++) {
        if (existingData[i][0] == eventId && existingData[i][1] == chatId) {
          return { success: false, message: "Ya estás suscrito a este evento." };
        }
      }
    }
    
    var success = insertRow(SPREADSHEET_ID, SHEET_EVENT_USER, [eventId, chatId, new Date()]);
    return { success: success, message: success ? "Subscription sucess" : "Error data base" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}


/**
 * Removes a user's subscription from the sheet.
 * @param {number} eventId - The ID of the event.
 * @param {number|string} chatId - The user's chat ID.
 * @returns {Object} Result of the operation.
 */
function unsubscribeUserFromEvent(eventId, chatId) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_EVENT_USER);
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == eventId && data[i][1] == chatId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Subscription removed." };
      }
    }
    return { success: false, message: "Subscription not found." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}


/**
 * Gets all subscriber chatIds for a specific event.
 * @param {number} eventId - The ID of the event.
 * @returns {Array} List of chat IDs.
 */
function getEventSubscribers(eventId) {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_EVENT_USER);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    
    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    var subscribers = [];
    
    var subscribers = data
    .filter(function(row) { return row[0] == eventId; })
    .map(function(row) { return row[1]; }); 

    return subscribers;
  } catch (e) {
    writeLog(SPREADSHEET_ID, "ERROR_FETCH_SUB", e.toString());
    return [];
  }
}



