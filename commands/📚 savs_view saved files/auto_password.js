/*CMD
  command: auto_password
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

// ===== auto_password command =====

let file_uid = params;
if (!file_uid) {
  Bot.sendMessage("❌ Invalid request. Please try again.");
  return;
}

// Function to generate random password
function generatePassword(length) {
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

let random_password = generatePassword(8);

// Get user files
let all_files = Bot.getProperty("user_files", {}) || {};
let user_files = all_files[user.telegramid] || [];

let index = user_files.findIndex(function(f) {
  return f.file_uid == file_uid;
});

if (index >= 0) {
  user_files[index].password = random_password;
  all_files[user.telegramid] = user_files;
  Bot.setProperty("user_files", all_files, "json");

  // Inline button - I Saved
  let buttons = [
    [{ text: "✅ I saved", callback_data: "delete_password_msg" }]
  ];

  // Send message with password + warning + button
  Api.sendMessage({
    chat_id: user.telegramid,
    text: "✅ A password has been auto-generated for your file.\n\n*🔑 Password:* `" + random_password + "`\n\n⚠️ *Important:* If you forget this password, you won’t be able to access this file again. Please save it somewhere safe before pressing 'I saved'.",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: buttons
    }
  });

} else {
  Bot.sendMessage("❌ File not found.");
}
