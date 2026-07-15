// The HTML grammar now lives in @particle-academy/fancy-file-commons (the one
// grammar commons ships — it's what the shared Editor source view needs).
// Re-exported so `./html` importers (php tokenizer, language registration)
// and fancy-code's IDE keep working unchanged.
export { tokenizeHtml } from "@particle-academy/fancy-file-commons";
