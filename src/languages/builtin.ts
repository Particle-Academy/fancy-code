import { registerLanguage } from "./registry";
import { tokenizeJavaScript } from "../engine/tokenizers/javascript";
import { tokenizeHtml } from "../engine/tokenizers/html";
import { tokenizePhp } from "../engine/tokenizers/php";
import { tokenizePython } from "../engine/tokenizers/python";
import { tokenizeGo } from "../engine/tokenizers/go";
import { tokenizeMarkdown } from "../engine/tokenizers/markdown";

registerLanguage({
  name: "Markdown",
  aliases: ["md", "markdown", "mkd"],
  tokenize: tokenizeMarkdown,
});

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

registerLanguage({
  name: "Python",
  aliases: ["py", "python"],
  tokenize: tokenizePython,
});

registerLanguage({
  name: "Go",
  aliases: ["go", "golang"],
  tokenize: tokenizeGo,
});
