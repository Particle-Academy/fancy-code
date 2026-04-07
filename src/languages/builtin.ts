import { registerLanguage } from "./registry";
import { tokenizeJavaScript } from "../engine/tokenizers/javascript";
import { tokenizeHtml } from "../engine/tokenizers/html";
import { tokenizePhp } from "../engine/tokenizers/php";

registerLanguage({
  name: "JavaScript",
  aliases: ["js", "javascript", "jsx"],
  tokenize: tokenizeJavaScript,
});

registerLanguage({
  name: "TypeScript",
  aliases: ["ts", "typescript", "tsx"],
  tokenize: tokenizeJavaScript, // Same tokenizer — JS/TS syntax is identical for highlighting
});

registerLanguage({
  name: "HTML",
  aliases: ["html", "htm"],
  tokenize: tokenizeHtml,
});

registerLanguage({
  name: "PHP",
  aliases: ["php"],
  tokenize: tokenizePhp,
});
