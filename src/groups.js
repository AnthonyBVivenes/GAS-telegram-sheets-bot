


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



/**
 * Fetches all public groups from the spreadsheet.
 * @returns {string} Formatted list of groups.
 */
function fetchGroupsList() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_GROUPS);
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return "No hay grupos disponibles actualmente.";

    var message = "*GRUPOS DISPONIBLES:*\n\n";
    for (var i = 1; i < data.length; i++) {
      // index 0: id, index 1: name, index 2: description
      message += "ID: " + data[i][0] + " - *" + data[i][1] + "*\n";
      message += "Desc: " + data[i][2] + "\n\n";
    }
    return message;
  } catch (e) {
    return "Error al obtener la lista de grupos.";
  }
}

/**
 * Creates a new group in the spreadsheet.
 * @param {string} name - Group name.
 * @param {string} description - Group description.
 * @returns {Object} Result of the operation.
 */
function createGroup(name, description) {
  try {
    var groupId = generateAutoId(SHEET_GROUPS, 0);
    var groupData = [
      groupId,
      name,
      description,
      new Date() // creation_date
    ];
    
    insertRow(SPREADSHEET_ID, SHEET_GROUPS, groupData);
    return { success: true, message: "Grupo creado exitosamente con ID: " + groupId };
  } catch (e) {
    writeLog(SPREADSHEET_ID, "CREATE_GROUP_ERROR", e.toString());
    return { success: false, message: "Error al crear el grupo: " + e.toString() };
  }
}



/**
 * Sends a message to all users belonging to a specific group.
 * Location: groups.js
 */
function broadcastToGroup(groupId, messageText) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var members = ss.getSheetByName(SHEET_GROUP_MEMBER).getDataRange().getValues();
    var sentCount = 0;
    var recipients = [];

    // Filter members by groupId (Column 0 in your schema)
    for (var i = 1; i < members.length; i++) {
      if (members[i][0] == groupId) {
        recipients.push(members[i][1]); // chat_id is index 1
      }
    }

    if (recipients.length === 0) {
      return { success: false, message: "No hay miembros en este grupo." };
    }

    for (var j = 0; j < recipients.length; j++) {
      postToTelegram(BOT_TOKEN, "sendMessage", {
        chat_id: recipients[j],
        text: "*ANUNCIO DE GRUPO:*\n\n" + messageText,
        parse_mode: "Markdown"
      });
      sentCount++;
    }

    return { success: true, totalSent: sentCount };
  } catch (e) {
    writeLog(SPREADSHEET_ID, "GROUP_BROADCAST_ERROR", e.toString());
    return { success: false, message: "Error: " + e.toString() };
  }
}