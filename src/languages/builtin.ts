import { registerLanguage } from "./registry";
// Every grammar lives in @particle-academy/fancy-file-commons, shared with
// react-fancy's CodeBlock / CodeView; fancy-code only registers them.
import {
  tokenizeJavaScript,
  tokenizeHtml,
  tokenizePhp,
  tokenizePython,
  tokenizeGo,
  tokenizeMarkdown,
  tokenizeShell,
  tokenizeDotenv,
} from "@particle-academy/fancy-file-commons";

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

registerLanguage({
  name: "Shell",
  aliases: ["sh", "bash", "zsh", "shell"],
  tokenize: tokenizeShell,
});

registerLanguage({
  name: "Dotenv",
  aliases: ["env", "dotenv"],
  tokenize: tokenizeDotenv,
});
