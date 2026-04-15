

/**
 * Gets user data from "usuarios" sheet and formats it.
 * @param {string|number} chatId - The user's chat ID.
 * @returns {string} Formatted profile text.
 */
function findUserByChatIdFormatted(chatId) {
  try {
    // SPREADSHEET_ID must be defined in your config or main.js
    // findRowByValue exists in your core.js (column 3 is chatId)
    var rowIndex = findRowByValue(SPREADSHEET_ID, "usuarios", 3, chatId);
    
    if (rowIndex === -1) {
      return "User not found in database.";
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("usuarios");
    var data = sheet.getRange(rowIndex, 1, 1, 6).getValues()[0];
    
    // formatDateTime exists in your core.js
    return "*MY PROFILE*\n\n" +
           "*Name:* " + data[1] + "\n" +
           "*Username:* @" + data[0] + "\n" +
           "*Chat ID:* " + data[3] + "\n" +
           "*Registered:* " + formatDateTime(data[5]);
  } catch (e) {
    return "Error reading profile: " + e.toString();
  }
}

/**
 * Updates the user nickname in column 3.
 * @param {string|number} chatId - The user's chat ID.
 * @param {string} newNickname - The new nickname to set.
 * @returns {boolean} True if success, false if not.
 */
function updateUserNickname(chatId, newNickname) {
  try {
    var rowIndex = findRowByValue(SPREADSHEET_ID, "usuarios", 3, chatId);
    if (rowIndex !== -1) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("usuarios");
      sheet.getRange(rowIndex, 3).setValue(newNickname); 
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Returns a list of all users for the admin.
 * @returns {string} Formatted list of users.
 */
function fetchAllUsersFormatted() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("usuarios");
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return "No users registered.";
    
    var list = " *REGISTERED USERS:*\n\n";
    for (var i = 1; i < data.length; i++) {
      // CAMBIO: data[i]
      list += i + ". " + data[i][1] + " (@" + data[i][0] + ") - ID: " + data[i][3] + "\n";
    }
    return list;
  } catch (e) {
    return "Error fetching users.";
  }
}

/**
 * Ensures a user is registered in the spreadsheet.
 * Standard: camelCase for functions and variables.
 * * @param {Object} telegramUser - The 'from' object from Telegram.
 * @returns {string} Status message for the user.
 */
function handleUserRegistration(telegramUser) {
  try {
    const chatId = telegramUser.id;
    const userRowIndex = findRowByValue(SPREADSHEET_ID, SHEET_USERS, 3, chatId);
    
    // Check if user already exists
    if (userRowIndex !== -1) {
      return "Welcome back! Your profile is already active. 👋";
    }

    // Prepare data 
    const newUserRow = [
      telegramUser.username || "N/A",
      telegramUser.first_name,
      telegramUser.first_name, // Initial nickname
      chatId,
      "user",                 // Default role
      new Date()              // Created at
    ];
    
    const isSuccess = insertRow(SPREADSHEET_ID, SHEET_USERS, newUserRow);
    
    return isSuccess 
      ? "Registration successful! You've been added to our database." 
      : "Registration failed. Please try again later.";
      
  } catch (error) {
    writeLog(SPREADSHEET_ID, "REGISTRATION_ERROR", error.toString());
    return "An error occurred during registration. Our team has been notified.";
  }
}