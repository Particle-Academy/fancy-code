import { cn, ContentRenderer, FauxClient, MediaViewer } from "@particle-academy/react-fancy";
import { CodeEditor } from "../CodeEditor";
import { resolveFileKind } from "../../file-type";
import type { FileViewerProps } from "./FileViewer.types";

/**
 * A unified file viewer: renders text files in a read-only `CodeEditor` (with
 * syntax highlighting picked from the filename) and media files — image, video,
 * audio, PDF — via react-fancy's `<MediaViewer>`. The text-vs-media decision is
 * made by {@link resolveFileKind}; pass `fileKind` to override it, or call
 * `resolveFileKind` yourself to branch your own chrome (tabs, save buttons).
 *
 * Give the container a height for media files (PDF/image/video fill their box).
 *
 * ```tsx
 * // text
 * <FileViewer filename="app.tsx" value={source} />
 * // media
 * <FileViewer filename="logo.png" src={url} style={{ height: 360 }} />
 * ```
 */
export function FileViewer({
  filename,
  mime,
  src,
  value = "",
  onChange,
  readOnly = true,
  theme = "auto",
  fileKind,
  lineNumbers = true,
  wordWrap = false,
  line,
  column,
  highlightLines,
  minHeight,
  maxHeight,
  mediaProps,
  view = "rendered",
  frameProps,
  className,
  style,
}: FileViewerProps) {
  const resolved = fileKind ?? resolveFileKind({ filename, mime });

  // A document reads as a reader sees it. Its source is shown instead when the
  // caller is editing, asked for it, or wants to land on a line (a line is a
  // place in the source, not in the rendered page).
  if (resolved.kind === "document" && view === "rendered" && readOnly && line == null) {
    return (
      <div
        data-fancy-file-viewer=""
        data-kind="document"
        data-format={resolved.format}
        className={className}
        style={style}
      >
        <FauxClient variant="device" controls fill bodyClassName="overflow-auto" {...frameProps}>
          <div className="px-6 py-5">
            <ContentRenderer
              value={resolved.format === "text" ? textToHtml(value) : value}
              format={resolved.format === "markdown" ? "markdown" : "html"}
            />
          </div>
        </FauxClient>
      </div>
    );
  }

  // Office files are binary: never text. Until a viewer for the format is wired
  // in, they get MediaViewer's "no preview" card with a download.
  if (resolved.kind === "office") {
    return (
      <div
        data-fancy-file-viewer=""
        data-kind="office"
        data-office-kind={resolved.officeKind}
        className={cn("overflow-hidden", className)}
        style={style}
      >
        <MediaViewer src={src ?? ""} mime={mime} alt={filename} className="h-full w-full" />
      </div>
    );
  }

  if (resolved.kind === "media") {
    // Image / video / PDF fill the sized wrapper so a height set on FileViewer
    // reaches the viewer; audio is a fixed-height card and shouldn't stretch.
    const { className: mediaClassName, ...restMediaProps } = mediaProps ?? {};
    const fill = resolved.mediaKind !== "audio";
    return (
      <div
        data-fancy-file-viewer=""
        data-kind="media"
        data-media-kind={resolved.mediaKind}
        className={cn("overflow-hidden", className)}
        style={style}
      >
        <MediaViewer
          src={src ?? ""}
          mime={mime}
          alt={filename}
          kind={resolved.mediaKind}
          className={cn(fill && "h-full w-full", mediaClassName)}
          {...restMediaProps}
        />
      </div>
    );
  }

  return (
    <div
      data-fancy-file-viewer=""
      data-kind="text"
      className={className}
      style={style}
    >
      <CodeEditor
        value={value}
        onChange={readOnly ? undefined : onChange}
        language={resolved.language}
        theme={theme}
        readOnly={readOnly}
        lineNumbers={lineNumbers}
        wordWrap={wordWrap}
        minHeight={minHeight}
        maxHeight={maxHeight}
        // CodeEditor already reveals `cursorLine` on mount and on change; this
        // component never passed one through, so a viewer could not land anywhere.
        cursorLine={line}
        cursorColumn={column}
        highlightLines={highlightLines ?? (line != null ? [line] : undefined)}
      >
        <CodeEditor.Panel />
      </CodeEditor>
    </div>
  );
}

FileViewer.displayName = "FileViewer";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * Plain text as HTML a reader would expect: a blank line is a new paragraph, a
 * single newline a line break, and every character escaped -- `*x*` in a text
 * file is asterisks, not emphasis, so it is not given to the Markdown renderer.
 */
function textToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .filter((block) => block.trim() !== "")
    .map((block) => `<p>${block.replace(/[&<>"']/g, (c) => ESCAPES[c]).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
