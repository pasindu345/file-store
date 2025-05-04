/*CMD
  command: /menu1
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Required user variables
let userID = user.telegramid;
let username = user.username ? "@" + user.username : "N/A";
let fullName = user.first_name + (user.last_name ? " " + user.last_name : "");

// Fetch user's saved files
let all_files = Bot.getProperty("user_files", {}) || {};
let user_files = all_files[user.telegramid] || [];
let totalFiles = user_files.length;  // Get actual number of files

let currentTime = Libs.DateTimeFormat.format(new Date(), "dd.MM.yyyy HH:mm:ss", "Asia/Colombo");

// Message content
let text = "<b>🧒 User Profile</b>\n\n" +
  "<b>🆔 User ID:</b> <code>" + userID + "</code>\n" +
  "<b>👀 Username:</b> " + username + "\n" +
  "<b>✏️ Name:</b> " + fullName + "\n" +
  "<b>📚 Total Files:</b> " + totalFiles + "\n\n" +
  "<b>⏰ Current Time (Colombo):</b> " + currentTime;

// Inline keyboard
let keyboard = [
  [ { text: "👤 Profile", callback_data: "profile" } ],
  [ { text: "📤 Upload", callback_data: "upload" }, { text: "🗂 Files", callback_data: "/m" } ]
];

// Edit message
Api.editMessageText({
  chat_id: user.telegramid,
  message_id: request.message.message_id,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyboard }
});
