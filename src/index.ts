// Components
export { CodeEditor, useCodeEditor } from "./components/CodeEditor";
export type {
  CodeEditorProps,
  CodeEditorContextValue,
  CodeEditorToolbarProps,
  CodeEditorPanelProps,
  CodeEditorStatusBarProps,
} from "./components/CodeEditor";

// MarkdownEditor — code editor (markdown highlighting) + optional live preview.
export { MarkdownEditor } from "./components/MarkdownEditor";
export type { MarkdownEditorProps, MarkdownEditorMode } from "./components/MarkdownEditor";

// FileViewer — unified viewer: CodeEditor for text, react-fancy's <MediaViewer>
// for image/video/audio/PDF. resolveFileKind exposes the text-vs-media decision.
export { FileViewer } from "./components/FileViewer";
export type { FileViewerProps } from "./components/FileViewer";
export { resolveFileKind, languageFromFilename } from "./file-type";
export type { FileKind, ResolveFileKindInput } from "./file-type";
// Dependency-free markdown → HTML renderer used by the preview pane (override-able).
export { renderMarkdown } from "./engine/markdown-render";
export { tokenizeMarkdown } from "./engine/tokenizers/markdown";

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
