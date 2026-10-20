import { useEffect, useState } from "react";
import { Callout, cn, ContentRenderer, FauxClient, MediaViewer } from "@particle-academy/react-fancy";
import { officeViewerFor } from "../../office-viewers";
import { CodeEditor } from "../CodeEditor";
import { resolveFileKind, type OfficeKind } from "../../file-type";
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
  document,
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
        <OfficeFile
          kind={resolved.officeKind}
          document={document}
          src={src}
          mime={mime}
          filename={filename}
          frameProps={frameProps}
        />
      </div>
    );
  }

  if (resolved.kind === "media") {
    // Image / video / PDF fill the sized wrapper so a height set on FileViewer
    // reaches the viewer; audio is a fixed-height card and shouldn't stretch.
    const { className: mediaClassName, ...restMediaProps } = mediaProps ?? {};
    // Images and PDFs carry the FauxClient frame every file viewer does; a
    // caller can still pass `frame: false` through `mediaProps`.
    restMediaProps.imageProps = { frame: true, frameProps, ...restMediaProps.imageProps };
    restMediaProps.pdfProps = { frame: true, frameProps, ...restMediaProps.pdfProps };
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

type OfficeState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "read"; document: unknown }
  | { status: "failed"; message: string };

/**
 * An Office file in the viewer the app registered for its format.
 *
 * Where the contents come from, in order (owner, 2026-10-19: "both, server
 * preferred"): the `document` the app's server already read; else the file at
 * `src`, read in the browser by the reader the app registered; else the
 * download card. A file our reader cannot open says so, beside the download,
 * rather than showing an empty viewer.
 */
function OfficeFile({
  kind,
  document,
  src,
  mime,
  filename,
  frameProps,
}: {
  kind: OfficeKind;
  document: unknown;
  src?: string;
  mime?: string;
  filename?: string;
  frameProps?: FileViewerProps["frameProps"];
}) {
  const registration = officeViewerFor(kind);
  const read = registration?.read;
  const [state, setState] = useState<OfficeState>({ status: "idle" });

  useEffect(() => {
    if (!registration || document !== undefined || !src || !read) return;
    let live = true;
    setState({ status: "reading" });
    fetch(src)
      .then(async (response) => {
        if (!response.ok) throw new Error(`The file could not be fetched (${response.status}).`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        const doc = read(bytes);
        if (live) setState({ status: "read", document: doc });
      })
      .catch((error: unknown) => {
        if (live) setState({ status: "failed", message: error instanceof Error ? error.message : String(error) });
      });

    return () => {
      live = false;
    };
  }, [registration, document, src, read]);

  const fallback = <MediaViewer src={src ?? ""} mime={mime} alt={filename} className="h-full w-full" />;

  if (!registration) return fallback;

  const View = registration.View;
  if (document !== undefined) return <View document={document} filename={filename} frameProps={frameProps} />;
  if (state.status === "read") return <View document={state.document} filename={filename} frameProps={frameProps} />;
  if (state.status === "reading") {
    return <div className="flex h-full items-center justify-center p-6 text-sm text-zinc-500">Opening {filename ?? "the file"}…</div>;
  }
  if (state.status === "failed") {
    return (
      <div className="flex h-full flex-col gap-2 p-2">
        <Callout color="red">
          {filename ?? "This file"} could not be opened: {state.message}
        </Callout>
        {fallback}
      </div>
    );
  }

  return fallback;
}

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
