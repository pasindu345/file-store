/*CMD
  command: download_
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

// Get file UID from params
let file_uid = params;

// Safely get user's file list
let all_data = Bot.getProperty("user_files", {}) || {};
let fileList = all_data[user.telegramid] || [];

// Find the file
let file = fileList.find(function(f) {
  return f.file_uid == file_uid;
});

if (!file) {
  Bot.sendMessage("❌ File not found.");
  throw "File not found";
}

// Handle password protection
if (file.password) {
  // Check if we need to edit an existing message or send new one
  if (request && request.message_id) {
    try {
      // Only edit if content would actually change
      Api.editMessageText({
        chat_id: user.telegramid,
        message_id: request.message_id,
        text: "🔒 *Please enter the password for this file.*\n\n_Your message will be auto-deleted._",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cancel", callback_data: "manage_file " + file_uid }]
          ]
        }
      });
    } catch (e) {
      // If edit fails (like when content is same), just send new message
      Bot.sendMessage({
        chat_id: user.telegramid,
        text: "🔒 *Please enter the password for this file.*\n\n_Your message will be auto-deleted._",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cancel", callback_data: "manage_file " + file_uid }]
          ]
        }
      });
    }
  } else {
    Bot.sendMessage({
      chat_id: user.telegramid,
      text: "🔒 *Please enter the password for this file.*\n\n_Your message will be auto-deleted._",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Cancel", callback_data: "manage_file " + file_uid }]
        ]
      }
    });
  }

  // Store password verification data
  Bot.setProperty("await_download_pass_" + user.telegramid, JSON.stringify({
    file_uid: file.file_uid,
    correct_pass: file.password,
    file_type: file.file_type,
    date: new Date().toISOString() // Fixed date handling
  }), "string");
  
  Bot.runCommand("await_download_pass");
} else {
  sendTheFile(file);
}

// Improved file sending function
function sendTheFile(file) {
  try {
    let sendOpts = {
      chat_id: user.telegramid,
      caption: "📄 *" + (file.custom_title || file.file_name || "File") + "*",
      parse_mode: "Markdown"
    };

    // Get file from the correct property based on type
    let fileData;
    switch(file.file_type) {
      case "photo":
        fileData = Bot.getProperty("user_photos", {})[file.file_uid];
        sendOpts.photo = fileData.file_id;
        Api.sendPhoto(sendOpts);
        break;
        
      case "video":
        fileData = Bot.getProperty("user_videos", {})[file.file_uid];
        sendOpts.video = fileData.file_id;
        Api.sendVideo(sendOpts);
        break;
        
      case "document":
        fileData = Bot.getProperty("user_documents", {})[file.file_uid];
        sendOpts.document = fileData.file_id;
        Api.sendDocument(sendOpts);
        break;
        
      case "text":
        let textData = Bot.getProperty("user_texts", {})[file.file_uid];
        Bot.sendMessage({
          chat_id: user.telegramid,
          text: "📝 *Text Content:*\n" + textData.content,
          parse_mode: "Markdown"
        });
        break;
        
      default:
        throw "Unsupported file type";
    }
    
    Bot.sendMessage("✅ File sent successfully!");
  } catch (e) {
    Bot.sendMessage("❌ Failed to send file: " + e.message);
    console.error("File sending error:", e);
  }
}
