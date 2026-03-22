

/* Gestiona las solicitudes POST de Telegram.*/
function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);
    if (update.callback_query) {
      procesarCallbackQuery(update.callback_query.message.chat.id.toString(), update.callback_query.data);
      return;
    }
    if (!update.message) return;
    var chatId = update.message.chat.id.toString();
    var userId = update.message.from.id;
    var firstName = update.message.from.first_name || "usuario";
    var username = update.message.from.username || "sin_username";
    var text = update.message.text || "";
    if (text === "/start") {
      registrarUsuario(chatId, userId, firstName, username);
      PropertiesService.getUserProperties().deleteProperty(chatId);
      mostrarMenuPrincipal(chatId);
      return;
    }
    if (update.message.photo) {
      var fotoUrl = update.message.photo[update.message.photo.length - 1].file_id;
      procesarFoto(chatId, fotoUrl, userId, firstName, username);
    } else {
      procesarMensajeTexto(chatId, text, userId, firstName, username);
    }
  } catch (err) {
    console.error(err.toString());
  }
}

/* Envia el menu con botones inline al usuario */
function mostrarMenuPrincipal(chatId) {
  try {
    var teclado = {
      inline_keyboard: [
        [{ text: "Guardar mensaje", callback_data: "btn_guardar" }],
        [{ text: "Leer mensajes", callback_data: "btn_leer" }],
        [{ text: "Eliminar ultimo mensaje", callback_data: "btn_eliminar" }],
        [{ text: "Modificar apodo", callback_data: "btn_apodo" }],
        [{ text: "Enviar al admin", callback_data: "btn_admin" }]
      ]
    };
    enviarInline(chatId, "seleccione una opcion:", teclado);
  } catch (e) {}
}

/* Gestiona las respuestas de los botones inline y actualiza estados. */
function procesarCallbackQuery(chatId, callbackData) {
  try {
    var props = PropertiesService.getUserProperties();
    if (callbackData === "btn_cancelar") {
      props.deleteProperty(chatId);
      enviarSimple(chatId, "Operacion cancelada");
      mostrarMenuPrincipal(chatId);
      return;
    }
    switch (callbackData) {
      case "btn_guardar":
        props.setProperty(chatId, "esperando_texto_mensaje");
        enviarConBoton(chatId, "Escribe el texto del mensaje que quieres guardar", "btn_cancelar", "Cancelar");
        break;
      case "btn_leer":
        enviarSimple(chatId, leerTodosMensajes());
        mostrarMenuPrincipal(chatId);
        break;
      case "btn_eliminar":
        enviarSimple(chatId, eliminarUltimoMensaje());
        mostrarMenuPrincipal(chatId);
        break;
      case "btn_apodo":
        props.setProperty(chatId, "esperando_nuevo_apodo");
        enviarConBoton(chatId, "Escribe el nuevo apodo que deseas asignarte", "btn_cancelar", "Cancelar");
        break;
      case "btn_admin":
        props.setProperty(chatId, "esperando_texto_admin");
        enviarConBoton(chatId, "Escribe el texto del mensaje que quieres enviar al administrador", "btn_cancelar", "Cancelar");
        break;
      case "btn_saltar":
        var state = props.getProperty(chatId);
        var cachedTxt = props.getProperty(chatId + "_txt");
        if (state === "esperando_foto_mensaje") {
          guardarMensaje(cachedTxt, null, "", "", chatId);
          enviarSimple(chatId, "Mensaje guardado correctamente");
        } else if (state === "esperando_foto_admin") {
          enviarMensajeAdmin(cachedTxt, null, "usuario", "anonimo");
          enviarSimple(chatId, "Mensaje enviado a los administradores");
        }
        props.deleteProperty(chatId);
        mostrarMenuPrincipal(chatId);
        break;
    }
  } catch (e) {}
}

/* Procesa los mensajes de texto segun el estado actual del usuario. No devuelve valor. */
function procesarMensajeTexto(chatId, texto, userId, firstName, username) {
  try {
    var props = PropertiesService.getUserProperties();
    var estado = props.getProperty(chatId);
    if (!estado) return;
    if (estado === "esperando_texto_mensaje") {
      props.setProperty(chatId + "_txt", texto);
      props.setProperty(chatId, "esperando_foto_mensaje");
      var t1 = { inline_keyboard: [[{ text: "Saltar", callback_data: "btn_saltar" }, { text: "Cancelar", callback_data: "btn_cancelar" }]] };
      enviarInline(chatId, "Ahora puedes enviar una foto (opcional)", t1);
    } else if (estado === "esperando_nuevo_apodo") {
      enviarSimple(chatId, modificarApodo(chatId, texto));
      props.deleteProperty(chatId);
      mostrarMenuPrincipal(chatId);
    } else if (estado === "esperando_texto_admin") {
      props.setProperty(chatId + "_txt", texto);
      props.setProperty(chatId, "esperando_foto_admin");
      var t2 = { inline_keyboard: [[{ text: "Saltar", callback_data: "btn_saltar" }, { text: "Cancelar", callback_data: "btn_cancelar" }]] };
      enviarInline(chatId, "Ahora puedes enviar una foto (opcional)", t2);
    }
  } catch (e) {}
}



/* Recepcion de fotos y ejecuta la accion segun el estado. No devuelve nada. */
function procesarFoto(chatId, fotoUrl, userId, firstName, username) {
  try {
    var props = PropertiesService.getUserProperties();
    var estado = props.getProperty(chatId);
    var textoPrevio = props.getProperty(chatId + "_txt");
    if (estado === "esperando_foto_mensaje") {
      guardarMensaje(textoPrevio, fotoUrl, firstName, username, chatId);
      enviarSimple(chatId, "Mensaje guardado correctamente");
    } else if (estado === "esperando_foto_admin") {
      enviarMensajeAdmin(textoPrevio, fotoUrl, firstName, username);
      enviarSimple(chatId, "Mensaje enviado a los administradores");
    }
    props.deleteProperty(chatId);
    mostrarMenuPrincipal(chatId);
  } catch (e) {}
}

/* Realiza el envio de mensajes de texto simples. No devuelve valor. */
function enviarSimple(chatId, texto) {
  var payload = { chat_id: chatId, text: texto };
  var options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload) };
  UrlFetchApp.fetch(API_URL + "sendMessage", options);
}

/* Envia un mensaje con un unico boton de cancelacion. No devuelve valor. */
function enviarConBoton(chatId, texto, callback, etiqueta) {
  var teclado = { inline_keyboard: [[{ text: etiqueta, callback_data: callback }]] };
  enviarInline(chatId, texto, teclado);
}

/* Realiza el envio de mensajes con teclados inline complejos. No devuelve valor. */
function enviarInline(chatId, texto, teclado) {
  var payload = { chat_id: chatId, text: texto, reply_markup: JSON.stringify(teclado) };
  var options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload) };
  UrlFetchApp.fetch(API_URL + "sendMessage", options);
}