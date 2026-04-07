import type { Tokenizer } from "../engine/tokenizer";

export interface LanguageDefinition {
  /** Display name shown in UI (e.g., "JavaScript") */
  name: string;
  /** Alternative keys (e.g., ["js", "javascript"]) */
  aliases?: string[];
  /** Tokenizer function for syntax highlighting */
  tokenize: Tokenizer;
}
