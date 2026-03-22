//EL token de tu bos(Obtenido de botfather).
var BOT_TOKEN = "bot:token";
//El ID de tu archivo sheets de google(Obtenido del enlace).
var SS_ID = "ss-id";
//El API de tl.
var API_URL = "https://api.telegram.org/bot" + BOT_TOKEN + "/";



/* Registra o actualiza un usuario en la hoja usuarios validando su chat_id. Devuelve objeto con success y message. */
function registrarUsuario(chatId, userId, firstName, username) {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("usuarios");
    var data = sheet.getDataRange().getValues();
    var userIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][3] == chatId) {
        userIndex = i + 1;
        break;
      }
    }
    if (userIndex === -1) {
      sheet.appendRow([username, firstName, "", chatId, new Date()]);
      return { success: true, message: "usuario registrado" };
    } else {
      sheet.getRange(userIndex, 1).setValue(username);
      sheet.getRange(userIndex, 2).setValue(firstName);
      return { success: true, message: "usuario actualizado" };
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/* Verifica si un chat_id existe en administradores. Devuelve booleano. */
function esAdmin(chatId) {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("admins");
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] == chatId) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/* Obtiene todos los chat_id de la hoja admins. Devuelve array de IDs. */
function obtenerChatIdsAdmin() {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("admins");
    var data = sheet.getDataRange().getValues();
    var admins = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][1]) admins.push(data[i][1]);
    }
    return admins;
  } catch (e) {
    return [];
  }
}

/* Envia un mensaje o foto a todos los administradores. Devuelve objeto con success y conteo. */
function enviarMensajeAdmin(texto, fotoUrl, firstNameOrigen, usernameOrigen) {
  try {
    var admins = obtenerChatIdsAdmin();
    var count = 0;
    var caption = "Mensaje de: " + firstNameOrigen + " (@" + usernameOrigen + ")\n" + texto;
    admins.forEach(function(adminId) {
      var payload = { chat_id: adminId };
      var method = "sendMessage";
      if (fotoUrl) {
        method = "sendPhoto";
        payload.photo = fotoUrl;
        payload.caption = caption;
      } else {
        payload.text = caption;
      }
      var options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload) };
      UrlFetchApp.fetch(API_URL + method, options);
      count++;
    });
    return { success: true, message: "notificacion enviada", cantidad: count };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/* Guarda un mensaje en la hoja. Devuelve objeto con success y message. */
function guardarMensaje(texto, fotoUrl, firstName, username, chatId) {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("mensajes");
    var foto = fotoUrl || "sin foto";
    sheet.appendRow([new Date(), texto, foto, username, firstName, chatId]);
    return { success: true, message: "mensaje guardado correctamente" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// Recupera todos los mensajes formateados en lista. Devuelve string con el listado.
function leerTodosMensajes() {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("mensajes");
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return "no hay mensajes registrados";
    var listado = "";
    for (var i = 1; i < data.length; i++) {
      listado += i + ". [" + data[i][0] + "] " + data[i][4] + " (@" + data[i][3] + "): " + data[i][1] + "\n";
    }
    return listado;
  } catch (e) {
    return "error al leer mensajes";
  }
}

/* Elimina la ultima fila con datos de la hoja mensajes. Devuelve string con el resultado. */
function eliminarUltimoMensaje() {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("mensajes");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return "no hay mensajes para eliminar";
    sheet.deleteRow(lastRow);
    return "ultimo mensaje eliminado correctamente";
  } catch (e) {
    return "error al eliminar mensaje";
  }
}

/* Actualiza el apodo de un usuario buscando por su chat_id. Devuelve string con el resultado. */
function modificarApodo(chatId, nuevoApodo) {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("usuarios");
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][3] == chatId) {
        sheet.getRange(i + 1, 3).setValue(nuevoApodo);
        return "Apodo actualizado a: " + nuevoApodo;
      }
    }
    return "error: usuario no encontrado";
  } catch (e) {
    return "error al modificar apodo";
  }
}