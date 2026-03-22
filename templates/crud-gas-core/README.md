# Telegram Bot con Google Sheets CRUD

Bot de Telegram que permite gestionar mensajes y usuarios mediante un sistema CRUD conectado a Google Sheets.

## Caracteristicas

- Menu interactivo con botones inline
- Guardado de mensajes con texto y fotos opcionales
- Lectura de todos los mensajes almacenados
- Eliminacion del ultimo mensaje
- Modificacion de apodo por usuario
- Envio de mensajes a administradores
- Registro automatico de usuarios al iniciar el bot
- Sistema de estados para flujos de entrada de datos
- Opcion de cancelar operaciones en cualquier momento

## Estructura de Google Sheets

El bot requiere un spreadsheet con las siguientes hojas:

### Hoja "mensajes"

| Columna | Descripcion |
|---------|-------------|
| timestamp | Fecha y hora del mensaje |
| texto | Contenido del mensaje |
| foto_url | URL de la foto (opcional) |
| username | Username de Telegram |
| first_name | Nombre de la cuenta |
| chat_id | ID del chat de Telegram |

### Hoja "usuarios"

| Columna | Descripcion |
|---------|-------------|
| username | Username de Telegram |
| first_name | Nombre de la cuenta |
| apodo | Apodo personalizado (editable por usuario) |
| chat_id | ID del chat de Telegram |
| fecha_registro | Fecha de primer ingreso |

### Hoja "admins"

| Columna | Descripcion |
|---------|-------------|
| nombre_admin | Nombre identificativo del administrador |
| chat_id | ID del chat de Telegram |

**Nota:** La hoja "admins" debe llenarse manualmente. El bot solo lee esta hoja para determinar a quien enviar los mensajes.

## Archivos del Proyecto

| Archivo | Descripcion |
|---------|-------------|
| core.js | Funciones de logica de negocio y operaciones con Sheets |
| main.js | Webhook de Telegram, manejo de menu y estados |

## Configuracion

### 1. Crear el Bot en Telegram

- Buscar @BotFather en Telegram
- Enviar `/newbot` y seguir las instrucciones
- Guardar el token que proporciona

### 2. Configurar Google Sheets

- Crear un nuevo spreadsheet
- Crear las tres hojas con los nombres y columnas especificados
- Copiar el ID del spreadsheet (de la URL)

### 3. Configurar Apps Script

- Crea un nuevo proyecto en script.google.com.
- Copia/sube los archivos core.js y main.js de la template
- Copiar el codigo correspondiente en cada archivo con extención .gs
- Ház una nueva implementación
- Autoriza y consede los permisos necesarios
- Configurar las variables globales:

```javascript
var BOT_TOKEN = "tu_token_de_telegram";
var SPREADSHEET_ID = "id_de_tu_spreadsheet";
```

### 4. Telegram & Vinculación

- Para que Telegram sepa a dónde enviar los mensajes, debes ejecutar una vez en tu navegador:
```
https://api.telegram.org/bot[TU_TOKEN]/setWebhook?url=[URL_APPS_SCRIPT]
```
- /start
- testea el bot