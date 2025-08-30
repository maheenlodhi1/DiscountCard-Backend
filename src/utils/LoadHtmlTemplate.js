const path = require("path");
const fs = require("fs");

const loadHtmlTemplate = (templateName, placeholders) => {
  const filePath = path.join(__dirname, "..", "emailtemplates", templateName);
  const template = fs.readFileSync(filePath, "utf-8");
  let html = template;
  if (placeholders) {
    for (const [key, value] of Object.entries(placeholders)) {
      const placeholder = `{{${key}}}`;
      html = html.replaceAll(placeholder, value);
    }
  }
  return html;
};

module.exports = loadHtmlTemplate;
