/*CMD
  command: /save
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

// ----- DELETE previous messages (if any) ----- 
try {
    // Delete user's original message if it exists
    if (request.message && request.message.message_id) {
        Api.deleteMessage({
            chat_id: request.message.chat.id,
            message_id: request.message.message_id
        });
    } else if (request.message_id) {
        Api.deleteMessage({
            chat_id: user.telegramid,
            message_id: request.message_id
        });
    }

    // Delete bot's previous waiting message if it exists
    let old_wait_msg_id = Bot.getProperty("temp_wait_msg_id");
    if (old_wait_msg_id) {
        try {
            Api.deleteMessage({
                chat_id: user.telegramid,
                message_id: old_wait_msg_id
            });
        } catch (e) {
            // Message might already be deleted, ignore error
        }
        Bot.setProperty("temp_wait_msg_id", "", "string"); // clear after delete
    }
} catch (e) {
    // Ignore any deletion errors to prevent the bot from stopping
    console.log("Error deleting previous messages:", e);
}

// ----- Check valid file input -----
if (!(request.photo || request.video || request.document || request.text)) {
    Bot.sendMessage({
        chat_id: user.telegramid,
        text: "❌ Please send a valid file, photo, video, document or text."
    });
    throw "Invalid input - no file detected";
}

// ----- Generate random file_uid -----
function generateUID(length) {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uid = "";
    for (let i = 0; i < length; i++) {
        uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
}

let file_uid = generateUID(12);
let file_type = "";
let file_id = "";
let file_name = "";
let custom_title = "";

// ----- Detect file type and save to separate properties -----
if (request.photo && Array.isArray(request.photo) && request.photo.length > 0) {
    let photoArr = request.photo;
    let largestPhoto = photoArr[photoArr.length - 1];
    file_type = "photo";
    file_id = largestPhoto.file_id;
    file_name = "Photo";
    
    // Save photo to separate property
    let photos = Bot.getProperty("user_photos", {}) || {};
    photos[file_uid] = {
        file_id: file_id,
        file_name: file_name,
        custom_title: request.caption || file_name
    };
    Bot.setProperty("user_photos", photos, "json");
    
} else if (request.video && request.video.file_id) {
    file_type = "video";
    file_id = request.video.file_id;
    file_name = request.video.file_name || "Video";
    
    // Save video to separate property
    let videos = Bot.getProperty("user_videos", {}) || {};
    videos[file_uid] = {
        file_id: file_id,
        file_name: file_name,
        custom_title: request.caption || file_name
    };
    Bot.setProperty("user_videos", videos, "json");
    
} else if (request.document && request.document.file_id) {
    file_type = "document";
    file_id = request.document.file_id;
    file_name = request.document.file_name || "Document";
    
    // Save document to separate property
    let documents = Bot.getProperty("user_documents", {}) || {};
    documents[file_uid] = {
        file_id: file_id,
        file_name: file_name,
        custom_title: request.caption || file_name
    };
    Bot.setProperty("user_documents", documents, "json");
    
} else if (request.text) {
    file_type = "text";
    file_id = "";
    file_name = request.text.substring(0, 100);
    
    // Save text to separate property
    let texts = Bot.getProperty("user_texts", {}) || {};
    texts[file_uid] = {
        content: request.text,
        custom_title: request.caption || "Text Note"
    };
    Bot.setProperty("user_texts", texts, "json");
}

if (!file_type) {
    Bot.sendMessage({
        chat_id: user.telegramid,
        text: "❌ Error detecting file type. Please try again."
    });
    throw "File type detection failed";
}

// ----- GET custom_title -----
custom_title = request.caption || file_name;

// ----- Save file UID and basic info to user_files -----
let user_files = Bot.getProperty("user_files", {}) || {};
if (!user_files[user.telegramid]) {
    user_files[user.telegramid] = [];
}

user_files[user.telegramid].push({
    file_uid: file_uid,
    file_type: file_type,
    custom_title: custom_title,
    password: "" // Initialize with empty password
});

Bot.setProperty("user_files", user_files, "json");

// ---- Send NEW file details message ----
let caption = "✅ File received successfully!\n\n";
caption += "📂 File Details Saved\n\n";
caption += "• Title: " + custom_title + "\n";
caption += "• File Type: " + file_type + "\n";
caption += "• Original Name: " + file_name + "\n";
caption += "• File UID: " + file_uid + "";

let buttons = [
    [
        { text: "🔐 Set Password", callback_data: "set_password " + file_uid },
        { text: "🎲 Auto-Generate Password", callback_data: "auto_password " + file_uid }
    ],
    [
        { text: "❌ No Password", callback_data: "save_file_now " + file_uid }
    ]
];

// Store the new message ID so we can delete it later if needed
let newMsg = Api.sendMessage({
    chat_id: user.telegramid,
    text: caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: buttons }
});
if (newMsg && newMsg.message_id) {
    Bot.setProperty("temp_wait_msg_id", newMsg.message_id, "string");
}
