/*CMD
  command: /start
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

// Function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Get current Sri Lanka (Colombo) time
let options = {
  timeZone: 'Asia/Colombo',
  hour12: true,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};
let sriLankaTime = escapeHtml(new Date().toLocaleString('en-US', options));

// Get user files count
let all_data = Bot.getProperty("user_files", {}) || {};
let userFiles = all_data[user.telegramid] || [];
let totalFiles = userFiles.length;

// Prepare user information with HTML escaping
let username = user.username ? '@' + escapeHtml(user.username) : 'N/A';
let fullName = escapeHtml(user.first_name || '') + ' ' + escapeHtml(user.last_name || '');

// Prepare the message text with HTML formatting
let messageText = 
  `<b>🧒 User Profile</b>\n\n` +
  `<b>🆔 User ID:</b> <code>${escapeHtml(user.telegramid)}</code>\n` +
  `<b>👀 Username:</b> ${username}\n` +
  `<b>✏️ Name:</b> ${fullName}\n` +
  `<b>📚 Total Files:</b> ${totalFiles}\n\n` +
  `<b>⏰ Current Time (Colombo):</b> ${sriLankaTime}`;

// Send message with inline keyboard
try {
  Api.sendMessage({
    chat_id: user.telegramid,
    text: messageText,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        // First row
        [
          { text: "🔐 Upload", callback_data: "save1" },
          { text: "📚 Files", callback_data: "/m" }
        ]
      ]
    }
  });
} catch (error) {
  console.error("Failed to send message:", error);
  // Fallback without HTML formatting
  Bot.sendMessage(user.telegramid, "Error loading menu. Please try again.");
}
