import { cn, MediaViewer } from "@particle-academy/react-fancy";
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
  minHeight,
  maxHeight,
  mediaProps,
  className,
  style,
}: FileViewerProps) {
  const resolved = fileKind ?? resolveFileKind({ filename, mime });

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
      >
        <CodeEditor.Panel />
      </CodeEditor>
    </div>
  );
}

FileViewer.displayName = "FileViewer";
