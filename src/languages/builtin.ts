import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { php } from "@codemirror/lang-php";
import { registerLanguage } from "./registry";

registerLanguage({
  name: "JavaScript",
  aliases: ["js", "javascript", "jsx"],
  support: () => javascript({ jsx: true }),
});

registerLanguage({
  name: "TypeScript",
  aliases: ["ts", "typescript", "tsx"],
  support: () => javascript({ typescript: true, jsx: true }),
});

registerLanguage({
  name: "HTML",
  aliases: ["html", "htm"],
  support: () => html(),
});

registerLanguage({
  name: "PHP",
  aliases: ["php"],
  support: () => php(),
});
