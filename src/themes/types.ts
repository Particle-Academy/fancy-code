import type { Extension } from "@codemirror/state";
import type { HighlightStyle } from "@codemirror/language";

export interface ThemeDefinition {
  /** Unique theme name */
  name: string;
  /** Whether this is a dark or light theme */
  variant: "light" | "dark";
  /** CodeMirror editor theme (gutter, cursor, selection, etc.) */
  editorTheme: Extension;
  /** Syntax highlighting color scheme */
  highlightStyle: HighlightStyle;
}
