/*CMD
  command: awaiting_title_input
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

let file_uid = Bot.getProperty("set_title_file_uid_" + user.telegramid);

if (!file_uid) {
  Bot.sendMessage("❌ No file selected to set title. Please try again.");
  return;
}

if (!request.text) {
  Bot.sendMessage("❌ Please send text as the title.");
  return;
}

let new_title = request.text;

let all_files = Bot.getProperty("user_files", {}) || {};
let user_files = all_files[user.telegramid] || [];

let file_found = false;
for (let i = 0; i < user_files.length; i++) {
  if (user_files[i].file_uid === file_uid) {
    user_files[i].custom_title = new_title;
    file_found = true;
    break;
  }
}

if (file_found) {
  all_files[user.telegramid] = user_files;
  Bot.setProperty("user_files", all_files, "json");

  Bot.sendMessage("✅ *Title has been updated successfully!*", { parse_mode: "Markdown" });
} else {
  Bot.sendMessage("❌ File not found.");
}
