/**
 * System Initializer
 * Automatically creates and formats the database structure based on DATABASE_SCHEMA.
 * * @author Anthony B. Vivenes
 * @version 1.1.0
 */
function initializeDatabaseSchema() {
  // Validate Spreadsheet
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "SPREADSHEET_ID") {
    Logger.log("CRITICAL ERROR: SPREADSHEET_ID is not defined in config.js");
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log("Starting database initialization...");

    DATABASE_SCHEMA.forEach(sheetInfo => {
      let sheet = ss.getSheetByName(sheetInfo.name);
      
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetInfo.name);
        Logger.log(`[CREATE] Sheet created: ${sheetInfo.name}`);
      } else {
        Logger.log(`[UPDATE] Sheet found: ${sheetInfo.name}. Refreshing headers...`);
      }

      // Apply headers
      setupSheetHeaders(sheet, sheetInfo.headers);
    });

    Logger.log("Database Schema Initialized Successfully!");
    
  } catch (e) {
    Logger.log("FATAL ERROR during setup: " + e.toString());
  }
}

/**
 * Internal helper to format sheet headers
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The target sheet.
 * @param {Array} headers - Array of strings for the header row.
 */
function setupSheetHeaders(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  
  headerRange.setValues([headers])
             .setFontWeight("bold")
             .setBackground("#EFEFEF") // Light gray for look
             .setVerticalAlignment("middle");
  
  sheet.setFrozenRows(1);
  
  // Clean up: auto-resize for readability
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}


/**
 * Programmatically creates a time-driven trigger for the notification system.
 * It checks every minute if there are pending alerts in the "notificador" sheet.
 * * @author Anthony B. Vivenes
 */
function setupNotificationTrigger() {
  const functionName = "checkAndSendPendingAlerts";
  const allTriggers = ScriptApp.getProjectTriggers();
  
  // Check for existing triggers to prevent duplicates
  const isTriggerActive = allTriggers.some(trigger => 
    trigger.getHandlerFunction() === functionName
  );

  if (!isTriggerActive) {
    ScriptApp.newTrigger(functionName)
      .timeBased()
      .everyMinutes(1)
      .create();
    
    Logger.log(`SUCCESS: Time-based trigger created for ${functionName}`);
  } else {
    Logger.log(`INFO: Trigger for ${functionName} is already active.`);
  }
}