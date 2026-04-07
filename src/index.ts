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
export type { ThemeDefinition } from "./themes";
