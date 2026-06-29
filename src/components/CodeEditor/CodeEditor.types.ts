import type { ReactNode, RefObject } from "react";
import type { UseEditorEngineReturn } from "../../hooks/use-editor-engine";

export interface CodeEditorProps {
  children: ReactNode;
  className?: string;
  /** Controlled value */
  value?: string;
  /** Initial value (uncontrolled) */
  defaultValue?: string;
  /** Called when the document changes */
  onChange?: (value: string) => void;
  /** Language name or alias (default: "javascript") */
  language?: string;
  /** Called when the language changes via the toolbar selector */
  onLanguageChange?: (lang: string) => void;
  /** Theme name: "light", "dark", "auto", or a custom registered name (default: "auto") */
  theme?: string;
  /** Prevent editing (default: false) */
  readOnly?: boolean;
  /** Show line numbers (default: true) */
  lineNumbers?: boolean;
  /** Enable word wrap (default: false) */
  wordWrap?: boolean;
  /** Tab size in spaces (default: 2) */
  tabSize?: number;
  /** Placeholder shown when empty */
  placeholder?: string;
  /** Minimum height in px */
  minHeight?: number;
  /** Maximum height in px (scrolls beyond this) */
  maxHeight?: number;
  /**
   * 1-based line to reveal (scroll to + place the caret on). Applied on mount
   * and whenever it (or `cursorColumn`) changes — so opening a file *at* a line,
   * or re-targeting an already-open file, scrolls the line into view. Does not
   * steal focus; call the imperative `revealLine`/`setCursor` (or `focus`) for
   * that. Out-of-range values clamp to document bounds.
   */
  cursorLine?: number;
  /** 1-based column for {@link cursorLine} (default 1). */
  cursorColumn?: number;
}

export interface CodeEditorContextValue {
  /** Get the current document text */
  getValue: () => string;
  /** Get the currently selected text */
  getSelection: () => string;
  /** Replace the entire document */
  setValue: (value: string) => void;
  /** Replace the current selection */
  replaceSelection: (text: string) => void;
  /** Focus the editor */
  focus: () => void;
  /**
   * Scroll to + place the caret on a 1-based `line` (optional 1-based `column`),
   * focusing the editor. Out-of-range positions clamp to document bounds.
   */
  revealLine: (line: number, column?: number) => void;
  /** Place the caret at a 1-based `{ line, column }` and reveal it (focuses). */
  setCursor: (pos: { line: number; column?: number }) => void;
  /** Current language name */
  language: string;
  /** Change the active language */
  setLanguage: (lang: string) => void;
  /** Current theme name */
  theme: string;
  /** Whether the editor is read-only */
  readOnly: boolean;
  /** Whether line numbers are shown */
  lineNumbers: boolean;
  /** Whether word wrap is enabled */
  wordWrap: boolean;
  /** Current tab size */
  tabSize: number;
  /** Toggle word wrap on/off */
  toggleWordWrap: () => void;
  /** Toggle line numbers on/off */
  toggleLineNumbers: () => void;
  /** Copy entire document to clipboard */
  copyToClipboard: () => Promise<void>;
  /** Current cursor position */
  cursorPosition: { line: number; col: number };
  /** Length of the current selection (0 if none) */
  selectionLength: number;
  /**
   * Ref to the underlying `<textarea>` element. Exposed so external
   * widgets — e.g. `<InputTag>`'s `textareaAdapter` — can attach to
   * the same input the editor renders into. Will be `null` before
   * the editor has mounted.
   */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Placeholder text */
  placeholder?: string;
  /** @internal */
  _engineReturn: UseEditorEngineReturn | null;
  /** @internal */
  _minHeight?: number;
  /** @internal */
  _maxHeight?: number;
}

export interface CodeEditorToolbarProps {
  children?: ReactNode;
  className?: string;
}

export interface CodeEditorPanelProps {
  className?: string;
}

export interface CodeEditorStatusBarProps {
  children?: ReactNode;
  className?: string;
}
