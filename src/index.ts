// Components
export { CodeEditor, useCodeEditor } from "./components/CodeEditor";
export type {
  CodeEditorProps,
  CodeEditorContextValue,
  CodeEditorToolbarProps,
  CodeEditorPanelProps,
  CodeEditorStatusBarProps,
} from "./components/CodeEditor";

// Language registration
export { registerLanguage, getLanguage, getRegisteredLanguages } from "./languages";
export type { LanguageDefinition } from "./languages";

// Theme registration
export { registerTheme, getTheme, getRegisteredThemes } from "./themes";
export type { ThemeDefinition, ThemeColors } from "./themes";

// Tokenizer types (for custom language authors)
export type { Token, TokenType, Tokenizer } from "./engine/tokenizer";

// InputTag glue — wires react-fancy's <InputTag> to the editor's textarea
export {
  useCodeEditorInputTagAdapter,
  CodeEditorInputTag,
  type CodeEditorInputTagProps,
} from "./input-tag";
