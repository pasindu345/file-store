/*CMD
  command: view_file
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 📚 savs/view saved files

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Get file UID from params and validate
let file_uid = params;
if (!file_uid || typeof file_uid !== 'string') {
  return Bot.sendMessage("❌ Invalid file reference");
}

// Safely get user's file list
let all_data = Bot.getProperty("user_files", {});
if (!all_data) { all_data = {}; }

let fileList = all_data[user.telegramid];
if (!fileList || !Array.isArray(fileList)) {
  fileList = [];
}

// Find file manually (without arrow functions)
var file = null;
for (var i = 0; i < fileList.length; i++) {
  if (fileList[i].file_uid === file_uid) {
    file = fileList[i];
    break;
  }
}

if (!file) {
  return Bot.sendMessage("❌ File not found or access denied");
}

// Get password from the specific file type property
var filePassword = "";
switch(file.file_type) {
  case "photo":
    let photos = Bot.getProperty("user_photos", {});
    if (photos[file_uid]) {
      filePassword = photos[file_uid].password || "";
    }
    break;
    
  case "video":
    let videos = Bot.getProperty("user_videos", {});
    if (videos[file_uid]) {
      filePassword = videos[file_uid].password || "";
    }
    break;
    
  case "document":
    let documents = Bot.getProperty("user_documents", {});
    if (documents[file_uid]) {
      filePassword = documents[file_uid].password || "";
    }
    break;
    
  case "text":
    let texts = Bot.getProperty("user_texts", {});
    if (texts[file_uid]) {
      filePassword = texts[file_uid].password || "";
    }
    break;
}

// Build information text (using HTML formatting properly)
var text = "<b>📄 " + (file.custom_title || file.file_name || "Unnamed File") + "</b>\n";
text += "📅 Date: <code>" + (file.date ? file.date : "Unknown") + "</code>\n";
text += "🔐 Protected: " + (filePassword ? "✅ Yes" : "❌ No") + "\n";
text += "📦 Type: " + (file.file_type ? file.file_type : "Unknown") + "\n";
if (filePassword) {
  text += "🔑 Password: <code>" + filePassword + "</code>\n";
}

// Create interactive buttons
var btns = [
  [ { text: "⬇️ Download", callback_data: "download_" + file_uid } ]
];

if (filePassword) {
  btns.push( [ { text: "🔑 Change Password", callback_data: "pass_change_" + file_uid } ] );
}

btns.push(
  [ { text: "🗑 Delete", callback_data: "confirm_delete_" + file_uid } ],
  [ { text: "◀️ Back to Files", callback_data: "file_list" } ]
);

// Safe way to get chat_id and message_id
var chat_id;
var message_id;

if (request && request.chat && request.chat.id) {
  chat_id = request.chat.id;
  message_id = request.message_id;
} else {
  chat_id = user.telegramid;
}

// Try to edit message or fallback to send new message
if (message_id) {
  Api.editMessageText({
    chat_id: chat_id,
    message_id: message_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: btns }
  });
} else {
  Api.sendMessage({
    chat_id: chat_id,
    text: text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: btns }
  });
}
