/*CMD
  command: set_title
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

// Callback query handler (set_title <file_uid>)
let file_uid = params;

let all_files = Bot.getProperty("user_files", {}) || {};
let user_files = all_files[user.telegramid] || [];

let target_file = user_files.find(f => f.file_uid === file_uid);

if (!target_file) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "❌ File not found.",
    show_alert: true
  });
  return;
}

let title = target_file.custom_title && target_file.custom_title.length > 0 ? target_file.custom_title : target_file.default_title;

Api.editMessageText({
  chat_id: user.telegramid,
  message_id: request.message.message_id,
  text: "*Current Title:* `" + title + "`\n\n_You can update the title below._",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "✏️ Set New Title", callback_data: "enter_new_title " + file_uid }],
      [{ text: "⬅️ Back", callback_data: "file_options " + file_uid }]
    ]
  }
});
