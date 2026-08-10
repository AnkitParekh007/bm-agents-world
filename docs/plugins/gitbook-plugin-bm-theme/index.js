const hljs = require("highlight.js");

module.exports = {
  book: { assets: "./assets", css: ["theme.css"], js: ["theme.js"] },
  blocks: {
    code(block) {
      let language = (block.kwargs.language || "").toLowerCase();
      if (language === "mermaid") return { body: block.body, html: false };
      if (language === "dotenv") language = "ini";
      if (language === "shell") language = "bash";
      try {
        return language
          ? hljs.highlight(block.body, { language }).value
          : hljs.highlightAuto(block.body).value;
      } catch (_error) {
        return { body: block.body, html: false };
      }
    },
    hint: {
      process(block) {
        const style = (block.kwargs && block.kwargs.style) || "info";
        return `<div class="bm-hint bm-hint-${style}">${block.body}</div>`;
      },
    },
  },
};
