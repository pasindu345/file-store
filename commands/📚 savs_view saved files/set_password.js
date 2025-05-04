/*CMD
  command: set_password
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

let file_uid = params; // passed from callback

let text = "🔑 *Please enter the password for this file.*\n\n_Your message will be auto-deleted._";
let cancel_btn = [[{ text: "◀️ Cancel", callback_data: "manage_file " + file_uid }]];

Api.editMessageText({
  chat_id: request.message.chat.id,
  message_id: request.message.message_id,
  text: text,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: cancel_btn }
});

// Directly run command with options (NO temp Bot property needed!)
Bot.run({
  command: "await_password_input",
  options: { file_uid: file_uid }
});
