// Minimal HTML sanitizer for rich-text fields (bios, descriptions, page block content)
// coming from the admin's TipTap editor. Strips script/style/event-handler vectors
// without pulling in a heavy DOM-based sanitizer dependency.
function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

module.exports = { sanitizeHtml };
