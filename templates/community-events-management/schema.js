/**
 * Database Schema Definition
 * Holds the structure, headers, and metadata for all required sheets.
 */
var DATABASE_SCHEMA = [
  {
    name: SHEET_USERS,
    headers: ["username", "first_name", "nickname", "chat_id", "role", "registration_date"]
  },
  {
    name: SHEET_EVENTS,
    headers: ["event_id", "name", "datetime", "description", "visibility", "created_at"]
  },
  {
    name: SHEET_LOGS,
    headers: ["timestamp", "type", "message"]
  },
  {
    name: SHEET_NOTIFIER,
    headers: ["alert_id", "event_id", "scheduled_datetime", "alert_message", "is_sent"]
  },
  {
    name: SHEET_GROUPS, 
    headers: ["group_id", "group_name", "description", "visibility", "created_at"]
  },
  {
    name: SHEET_ADMINS, 
    headers: ["chat_id"]
  },
  {
    name: SHEET_EVENT_USER,
    headers: ["event_id", "chat_id", "registration_date"]
  },
  {
    name: SHEET_GROUP_MEMBER,
    headers: ["group_id", "chat_id", "joined_at"]
  }
];