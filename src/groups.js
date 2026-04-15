


/**
 * Creates a new group using the core engine.
 * @param {string} groupName - Name of the group.
 * @param {string} groupDescription - Brief description.
 * @param {string} visibility - "public" or "private".
 * @returns {Object} Result of the operation.
 */
function createGroup(groupName, groupDescription, visibility) {
  try {
    
    var groupId = generateAutoId(SHEET_GROUPS, 0);
    
    // Preparation of the data array
    var data = [
      groupId, 
      groupName, 
      groupDescription, 
      visibility, 
      new Date()
    ];

    //var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NOTIFIER);
    if (findRowByValue(SPREADSHEET_ID, SHEET_GROUPS, 1, groupName) !== -1) {
      return { success: false, message: "Group name already exists" };
    }

    var success = insertRow(SPREADSHEET_ID, SHEET_GROUPS, data);

    return { 
      success: success, 
      message: success ? "Group created successfully" : "Failed to insert group", 
      groupId: groupId 
    };
  } catch (e) {
    writeLog(SPREADSHEET_ID, "ERROR_GROUPS", e.toString());
    return { success: false, message: e.toString() };
  }
}



/**
 * Adds a user to a specific group.
 * @param {number} groupId - The ID of the group.
 * @param {number|string} chatId - The user's chat ID.
 * @returns {Object} Result.
 */
function addUserToGroup(groupId, chatId) {
  try {
    var data = [groupId, chatId, new Date()];
    var success = insertRow(SPREADSHEET_ID, SHEET_GROUP_MEMBER, [groupId, chatId, new Date()]);
    return { success: success, message: success ? "User added to group" : "Error" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}