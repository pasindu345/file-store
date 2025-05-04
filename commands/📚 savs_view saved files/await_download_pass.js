/*CMD
  command: await_download_pass
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 📚 savs/view saved files

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

let prop = Bot.getProperty("await_download_pass_" + user.telegramid);
if (!prop) {
  Bot.sendMessage("❌ No download session found.");
  return;
}

let data = JSON.parse(prop);
let input_pass = message;

if (input_pass === data.correct_pass) {
  let all_data = Bot.getProperty("user_files", {});
  let fileList = all_data[user.telegramid];
  let file = fileList.find(function(f) {
    return f.file_uid == data.file_uid;
  });

  if (file) {
    sendTheFile(file);
    Bot.sendMessage("✅ Correct password. File sent!");
  } else {
    Bot.sendMessage("❌ File not found.");
  }

  Bot.setProperty("await_download_pass_" + user.telegramid, "", "string");

} else {
  Bot.sendMessage("❌ Incorrect password. Please try again:");
  Bot.runCommand("await_download_pass");
}

function sendTheFile(file){
  let sendOpts = {
    chat_id: user.telegramid,
    caption: "📄 *" + file.file_name + "*",
    parse_mode: "Markdown"
  };

  if (file.type === "photo") {
    sendOpts.photo = file.file_id;
    Api.sendPhoto(sendOpts);
  } else if (file.type === "video") {
    sendOpts.video = file.file_id;
    Api.sendVideo(sendOpts);
  } else {
    sendOpts.document = file.file_id;
    Api.sendDocument(sendOpts);
  }
}
