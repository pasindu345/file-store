/*CMD
  command: /m
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

// Function to escape HTML entities
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Get user data
let all_data = Bot.getProperty("user_files", {}) || {};
let fileList = all_data[user.telegramid] || [];
let username = user.username ? '@' + escapeHtml(user.username) : 'Not set';
let fullName = escapeHtml(user.first_name || '') + ' ' + escapeHtml(user.last_name || '');

if (!fileList || !Array.isArray(fileList) || fileList.length === 0) {
  let emptyMessage = `<b>📂 Your Saved Files</b>\n\n` +
                    `<i>❌ You haven't saved any files yet.</i>\n\n` +
                    `<b>👤 User Info</b>\n` +
                    `<b>Name:</b> ${fullName}\n` +
                    `<b>Username:</b> ${username}`;
  
  return Api.editMessageText({
    chat_id: user.telegramid,
    message_id: request.message.message_id,
    text: emptyMessage,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔙 Back to Menu", callback_data: "/menu1" }]
      ]
    }
  });
}

// Pagination settings
let page = params ? parseInt(params) : 1;
let per_page = 5;
let total_files = fileList.length;
let total_pages = Math.ceil(total_files / per_page);

if (isNaN(page) || page < 1) page = 1;
if (page > total_pages) page = total_pages;

// Slice files to show
let start = (page - 1) * per_page;
let end = start + per_page;
let files_to_show = fileList.slice(start, end);

let buttons = [];

// File buttons (max 5 per page)
files_to_show.forEach(function(f) {
  let raw_title = f.custom_title || f.default_title || f.file_name || "Untitled";
  let title = raw_title.length > 50 ? 
    escapeHtml(raw_title.substring(0, 47)) + "..." : 
    escapeHtml(raw_title);
  buttons.push([{ text: title, callback_data: "view_file " + f.file_uid }]);
});

// Navigation buttons
let nav_buttons = [];
if (page > 1) {
  nav_buttons.push({ text: "⬅️ Back", callback_data: "list_files " + (page - 1) });
}
nav_buttons.push({ text: "🔙 Menu", callback_data: "/menu1" }); // Added Back to Menu button
if (page < total_pages) {
  nav_buttons.push({ text: "➡️ Next", callback_data: "list_files " + (page + 1) });
}

if (nav_buttons.length > 0) {
  buttons.push(nav_buttons);
}

// Build message with HTML
let message_text = 
  `<b>👤 User Info</b>\n` +
  `<b>Name:</b> ${fullName}\n` +
  `<b>Username:</b> ${username}\n\n` +
  `<b>📂 Your Saved Files</b>\n\n` +
  `<b>📄 Total Files:</b> <code>${total_files}</code>\n` +
  `<b>📑 Page:</b> <code>${page} / ${total_pages}</code>\n\n` +
  `<i>Select a file below to view:</i>`;

// Edit existing message
Api.editMessageText({
  chat_id: user.telegramid,
  message_id: request.message.message_id,
  text: message_text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: buttons }
});
