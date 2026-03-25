# GAS-telegram-sheets-bot

**Ecosistema modular de automatización para Telegram utilizando Google Apps Script (GAS) y Google Sheets como base de datos.**

Este repositorio es una solución "low-code" para emprendedores y desarrolladores que buscan gestionar procesos de negocio (como panaderías , inventarios, automatización, recolección de datos o atención al cliente entre otros) de forma gratuita y escalable.

## Requisitos Globales

- Cuenta de Google (para **Apps Script** y **Sheets**).
- Token de Bot (vía @BotFather).
- Conocimientos básicos de **JavaScript (GAS)**(Solo si quiers modificar tu bot).

## Guía de Instalación Rápida

1. **Telegram**: Crea tu bot con [@BotFather](https://t.me/botfather) y obtén tu `BOT_TOKEN`.
2. **Google Sheets**: Crea un Spreadsheet y copia su `ID` desde la URL. Crea las hojas: `mensajes`, `usuarios` y `admins`.
3. **Apps Script**: 
   - Crea un nuevo proyecto en [Google Apps Script](https://script.google.com).
   - Copia los archivos `core.js` y `main.js` de la carpeta de plantillas (sigue las instrucciones de la carpeta del bot).
   - Pega tu `BOT_TOKEN` y `SS_ID` en las variables globales.
4. **Despliegue**: 
   - Haz clic en `Implementar` > `Nueva implementación`.
   - Tipo: **Aplicación Web**.
   - Acceso: **Cualquier persona**.
5. **Webhook**: Ejecuta la función `setWebhook()` dentro del editor de código para vincular el bot.

---

## Límites de Uso (Google Free Tier)

| Servicio | Límite diario |
| :--- | :--- |
| **UrlFetchApp** | 20,000 llamadas |
| **Celdas en Sheets** | 10,000,000 celdas |
| **Tiempo de Ejecución** | 6 min / ejecución / 6 h por día|

---