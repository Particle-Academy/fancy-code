import { cn, useControllableState } from "@particle-academy/react-fancy";
import { CodeEditor } from "../CodeEditor";
import { renderMarkdown } from "../../engine/markdown-render";

export type MarkdownEditorMode = "split" | "edit" | "preview";

export interface MarkdownEditorProps {
  /** Controlled markdown value. */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called with the new markdown whenever the document changes. */
  onValueChange?: (markdown: string) => void;
  /**
   * Layout: `split` (editor + live preview side by side), `edit` (editor only),
   * or `preview` (rendered only). Default `split`.
   */
  mode?: MarkdownEditorMode;
  /** Editor theme — `"light" | "dark" | "auto"` or a registered name. Default `auto`. */
  theme?: string;
  /** Prevent editing. */
  readOnly?: boolean;
  /** Show line numbers in the editor (default false — prose reads better without). */
  lineNumbers?: boolean;
  /** Wrap long lines in the editor (default true for prose). */
  wordWrap?: boolean;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Editor height bounds (px). */
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  /**
   * Swap the markdown → HTML renderer used by the preview pane (e.g. a full
   * CommonMark library). Defaults to the built-in lightweight renderer.
   */
  renderPreview?: (markdown: string) => string;
}

/**
 * A markdown-aware editor: a syntax-highlighted `CodeEditor` (the registered
 * `markdown` language) with an optional live preview pane. Controlled via
 * `value` + `onValueChange`. The preview renders with a small built-in
 * dependency-free renderer; pass `renderPreview` to use your own.
 *
 * ```tsx
 * <MarkdownEditor value={md} onValueChange={setMd} mode="split" minHeight={240} />
 * ```
 */
export function MarkdownEditor({
  value,
  defaultValue = "",
  onValueChange,
  mode = "split",
  theme = "auto",
  readOnly = false,
  lineNumbers = false,
  wordWrap = true,
  placeholder,
  minHeight,
  maxHeight,
  className,
  renderPreview = renderMarkdown,
}: MarkdownEditorProps) {
  const [content, setContent] = useControllableState(value, defaultValue, onValueChange);

  const showEditor = mode !== "preview";
  const showPreview = mode !== "edit";

  return (
    <div
      data-fancy-markdown-editor=""
      data-mode={mode}
      className={cn("fancy-md-editor", className)}
    >
      {showEditor && (
        <div className="fancy-md-editor-pane">
          <CodeEditor
            value={content}
            onChange={setContent}
            language="markdown"
            theme={theme}
            readOnly={readOnly}
            lineNumbers={lineNumbers}
            wordWrap={wordWrap}
            placeholder={placeholder}
            minHeight={minHeight}
            maxHeight={maxHeight}
          >
            <CodeEditor.Panel />
          </CodeEditor>
        </div>
      )}
      {showPreview && (
        <div
          data-fancy-markdown-preview=""
          className="fancy-md-preview"
          dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
        />
      )}
    </div>
  );
}

MarkdownEditor.displayName = "MarkdownEditor";
