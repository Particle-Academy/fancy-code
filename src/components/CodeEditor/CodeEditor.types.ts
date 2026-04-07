import type { ReactNode, RefObject } from "react";
import type { Extension } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

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
  /** Additional CodeMirror extensions */
  extensions?: Extension[];
}

export interface CodeEditorContextValue {
  /** The CodeMirror EditorView (null during SSR or before mount) */
  view: EditorView | null;
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
  /** @internal Ref for the CodeMirror mount point */
  _containerRef: RefObject<HTMLDivElement | null>;
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
