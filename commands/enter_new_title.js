/*CMD
  command: enter_new_title
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

// Callback query handler (enter_new_title <file_uid>)
let file_uid = params;

Bot.setProperty("set_title_file_uid_" + user.telegramid, file_uid, "string");

Api.editMessageText({
  chat_id: user.telegramid,
  message_id: request.message.message_id,
  text: "✏️ *Please send me the new title for this file:*",
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "⬅️ Cancel", callback_data: "file_options " + file_uid }]
    ]
  }
});

// Run command to await text
Bot.runCommand("awaiting_title_input");
