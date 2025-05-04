/*CMD
  command: save_file_now
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

// Delete the user's message containing sensitive info (password)
if (request && request.message) {
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
}

// Generate a unique 10-character file UID
function gen_uid() {
  return Math.random().toString(36).substring(2, 12);
}

// Get temporary upload and password data
let upload = Bot.getProperty("temp_upload", {});
let password = Bot.getProperty("temp_password", null);

// Initialize or get user files data
let all_data = Bot.getProperty("user_files", {});
if (typeof all_data !== 'object') all_data = {};

let user_id = user.telegramid;
if (!Array.isArray(all_data[user_id])) {
  all_data[user_id] = [];
}

// Create new file object with proper password handling
let new_file = {
  file_uid: gen_uid(),
  file_id: upload.file_id,
  file_name: upload.file_name || "unnamed_file",
  type: upload.file_type || "unknown",
  date: new Date().toISOString().split("T")[0],
  secure: !!password,  // Convert to boolean
  password: password || null  // Store null instead of empty string
};

// Add the new file to user's collection
all_data[user_id].push(new_file);

// Save the updated data
Bot.setProperty("user_files", all_data, "json");

// Clean up temporary properties
Bot.setProperty("temp_upload", null, "json");
Bot.setProperty("temp_password", null, "json");

// Send confirmation with file UID (useful for password management)
Bot.sendMessage(`✅ File saved successfully! ${new_file.secure ? "\n🔐 This file is password protected." : ""}\nFile UID: ${new_file.file_uid}`);
