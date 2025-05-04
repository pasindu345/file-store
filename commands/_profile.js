/*CMD
  command: /profile
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

let user_id = user.telegramid;
let all_data = Bot.getProperty("user_files", {});
let my_files = all_data[user_id] || [];

let file_count = my_files.length;

Bot.sendMessage(
  "*Profile Info:*\n" +
  "👤 *Name:* " + user.first_name + "\n" +
  "🔗 *Username:* @" + user.username + "\n" +
  "🗂️ *Total Saved Files:* " + file_count
);
