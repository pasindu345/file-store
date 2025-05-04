/*CMD
  command: delete_file
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

let all_data = Bot.getProperty("user_files", {});
if (!all_data) all_data = {};

let user_id = user.telegramid;
let file_uid = params.split(' ')[0];

let fileList = all_data[user_id];
if (!fileList || fileList.length === 0) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "❌ No files found.",
    show_alert: true
  });
  return;
}

let index = fileList.findIndex(function(f) {
  return f.file_uid == file_uid;
});

if (index === -1) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "❌ File not found.",
    show_alert: true
  });
  return;
}

// Delete file
fileList.splice(index, 1);
all_data[user_id] = fileList;
Bot.setProperty("user_files", all_data, "json");

Api.answerCallbackQuery({
  callback_query_id: request.id,
  text: "🗑️ File deleted.",
  show_alert: true
});

// Go back to file list
Bot.runCommand("list_files");
