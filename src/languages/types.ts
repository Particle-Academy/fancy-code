import type { LanguageSupport } from "@codemirror/language";

export interface LanguageDefinition {
  /** Display name shown in UI (e.g., "JavaScript") */
  name: string;
  /** Alternative keys (e.g., ["js", "javascript"]) */
  aliases?: string[];
  /** Factory returning the CodeMirror LanguageSupport extension */
  support: () => LanguageSupport | Promise<LanguageSupport>;
}
