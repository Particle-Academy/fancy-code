import { cn, ContentRenderer, useControllableState } from "@particle-academy/react-fancy";
import { CodeEditor } from "../CodeEditor";

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
  /**
   * Height bounds (px). `maxHeight` constrains the PREVIEW pane as well as the
   * editor — it previously reached only the editor, so a long document rendered
   * at full height instead of scrolling.
   */
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  /**
   * Swap the markdown → HTML renderer used by the preview pane.
   *
   * Rarely needed now: the preview renders through react-fancy's
   * `<ContentRenderer format="markdown">`, which is a full CommonMark + GFM
   * parse. Supply this only to impose your own pipeline — the returned HTML is
   * injected as-is, so it must already be sanitised.
   */
  renderPreview?: (markdown: string) => string;
}

/**
 * A markdown-aware editor: a syntax-highlighted `CodeEditor` (the registered
 * `markdown` language) with an optional live preview pane. Controlled via
 * `value` + `onValueChange`. The preview renders through react-fancy's
 * `<ContentRenderer format="markdown">` — a full CommonMark + GFM parse,
 * sanitised by default. Pass `renderPreview` to impose your own pipeline.
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
  renderPreview,
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
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          {renderPreview ? (
            // The host imposed its own pipeline; its HTML is injected as-is and
            // is its own responsibility to sanitise.
            <div dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
          ) : (
            // The kit's own renderer — a full CommonMark + GFM parse that
            // sanitises by default. `marked` already sits in this tree as a
            // react-fancy runtime dependency, so the built-in renderer this
            // replaced was a second, weaker markdown implementation next to a
            // complete one.
            <ContentRenderer value={content} format="markdown" />
          )}
        </div>
      )}
    </div>
  );
}

MarkdownEditor.displayName = "MarkdownEditor";
