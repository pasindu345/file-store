/*CMD
  command: await_password_input
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

let file_uid = options.file_uid; // Passed from previous step
let input_password = message;

// Safely delete user's password message
Api.deleteMessage({
  chat_id: user.telegramid,
  message_id: options.message_id // Use options.message_id instead of request
});

// 1. First update the password in user_files (main index)
let all_files = Bot.getProperty("user_files", {});
if (!all_files[user.telegramid] || !Array.isArray(all_files[user.telegramid])) {
  Bot.sendMessage("❌ You have no files saved.");
  return;
}

let fileFound = false;
let fileType = "";

// Find the file in user_files to get its type
for (let i = 0; i < all_files[user.telegramid].length; i++) {
  if (all_files[user.telegramid][i].file_uid === file_uid) {
    all_files[user.telegramid][i].password = input_password;
    fileType = all_files[user.telegramid][i].file_type;
    fileFound = true;
    break;
  }
}

if (!fileFound) {
  Bot.sendMessage("❌ File not found. Please make sure you're trying to set a password for the correct file.");
  return;
}

// Save changes to user_files
Bot.setProperty("user_files", all_files, "json");

// 2. Now update password in the specific file type property
let propertyKey = "";
switch (fileType) {
  case "photo":
    propertyKey = "user_photos";
    break;
  case "video":
    propertyKey = "user_videos";
    break;
  case "document":
    propertyKey = "user_documents";
    break;
  case "text":
    propertyKey = "user_texts";
    break;
  default:
    Bot.sendMessage("⚠️ Unknown file type. Password saved only in main file list.");
    Bot.sendMessage("✅ Password has been set for your file.");
    Bot.runCommand("save_file_now");
    return;
}

let fileCollection = Bot.getProperty(propertyKey, {});
if (fileCollection[file_uid]) {
  fileCollection[file_uid].password = input_password;
  Bot.setProperty(propertyKey, fileCollection, "json");
}

Bot.sendMessage("✅ Password has been set for your file.");
Bot.runCommand("save_file_now");
