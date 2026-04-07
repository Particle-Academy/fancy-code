export type { LanguageDefinition } from "./types";
export { registerLanguage, getLanguage, getRegisteredLanguages } from "./registry";

// Register built-in languages on import
import "./builtin";
