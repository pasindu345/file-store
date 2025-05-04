/*CMD
  command: save1
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

Api.editMessageText({
  chat_id: user.chatid,
  message_id: request.message.message_id,
  text: "⏳ Please send a file, photo, video, document or text..."
});

Bot.runCommand("/save")
