/*CMD
  command: handle_file_upload
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Check valid file input
if (!(request.photo || request.video || request.document || request.text)) {
  Bot.sendMessage("❌ Please send a valid file, photo, video, document or text.");
  return;
}

// ----- Generate random file_uid -----
function generateUID(length) {
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < length; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

let file_uid = generateUID(12);

let file_type = "";
let file_id = "";
let file_name = "";
let custom_title = "";

// ----- Detect file type -----
if (request.photo) {
  let photoArr = request.photo;
  let largestPhoto = photoArr[photoArr.length - 1];
  file_type = "photo";
  file_id = largestPhoto.file_id;
  file_name = "Photo";
}

if (!file_type && request.video && request.video.file_id) {
  file_type = "video";
  file_id = request.video.file_id;
  file_name = request.video.file_name ? request.video.file_name : "Video";
}

if (!file_type && request.document && request.document.file_id) {
  file_type = "document";
  file_id = request.document.file_id;
  file_name = request.document.file_name ? request.document.file_name : "Document";
}

if (!file_type && request.text) {
  file_type = "text";
  file_id = "";
  file_name = request.text.substring(0, 100);
}

if (!file_type) {
  Bot.sendMessage("❌ Error detecting file type. Please try again.");
  return;
}

// ----- GET custom_title -----
if (request.caption) {
  custom_title = request.caption;
} else {
  custom_title = file_name;
}

// ----- Save file into user_files -----
let all_files = Bot.getProperty("user_files", {}) || {};
let user_files = all_files[user.telegramid] || [];

user_files.push({
  file_uid: file_uid,
  file_type: file_type,
  file_id: file_id,
  file_name: file_name,
  custom_title: custom_title,
  password: ""
});

all_files[user.telegramid] = user_files;
Bot.setProperty("user_files", all_files, "json");

// ---- DELETE user file message ----
Api.deleteMessage({
  chat_id: user.telegramid,
  message_id: request.message.message_id
});

// ---- EDIT original waiting message to "File received" ----
let msg_id = Bot.getProperty("waiting_msg_id_" + user.telegramid);

if (msg_id) {
  Api.editMessageText({
    chat_id: user.telegramid,
    message_id: msg_id,
    text: "✅ File received successfully!",
    parse_mode: "HTML"
  });

  // Clear saved msg_id
  Bot.setProperty("waiting_msg_id_" + user.telegramid, "", "integer");
}

// ---- Send NEW file details message ----
let caption = "*📂 File Details Saved*\n\n";
caption += "*• Title:* `" + custom_title + "`\n";
caption += "*• File Type:* `" + file_type + "`\n";
caption += "*• Original Name:* `" + file_name + "`\n";
caption += "*• File UID:* `" + file_uid + "`";

let buttons = [
  [
    { text: "🔐 Set Password", callback_data: "set_password " + file_uid },
    { text: "🎲 Auto-Generate Password", callback_data: "auto_password " + file_uid }
  ],
  [
    { text: "❌ No Password", callback_data: "save_file_now " + file_uid }
  ]
];

Api.sendMessage({
  chat_id: user.telegramid,
  text: caption,
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: buttons
  }
});
