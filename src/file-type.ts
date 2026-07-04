import { resolveMediaType, type MediaKind } from "@particle-academy/react-fancy";
import { languageFromFilename } from "@particle-academy/fancy-file-commons";

/**
 * The decision a file viewer makes about a file: render it as editable text, or
 * hand it to a media viewer. `media` carries the resolved {@link MediaKind};
 * `text` carries the editor language id.
 */
export type FileKind =
  | { kind: "text"; language: string }
  | { kind: "media"; mediaKind: MediaKind };

export interface ResolveFileKindInput {
  /** File name or path — sniffed for an extension (and used for the media check). */
  filename?: string;
  /** MIME type — preferred over the filename when known. */
  mime?: string;
}

// Filename → language now lives in @particle-academy/fancy-file-commons (the
// shared core for the file packages — one EXT_LANGUAGE map suite-wide).
// Re-exported so existing `fancy-code` imports keep working.
export { languageFromFilename };

/**
 * Decide whether a file is previewable media (image / video / audio / PDF) or
 * text, from its MIME type (preferred) and/or filename. Media wins when the
 * type resolves to one; otherwise it's text and the editor language is derived
 * from the extension.
 *
 * Exposed so consumers can branch their own chrome (tabs, save buttons) the
 * same way `<FileViewer>` does internally.
 *
 * ```ts
 * resolveFileKind({ filename: "logo.png" });   // { kind: "media", mediaKind: "image" }
 * resolveFileKind({ filename: "app.tsx" });     // { kind: "text", language: "typescript" }
 * resolveFileKind({ mime: "application/pdf" }); // { kind: "media", mediaKind: "pdf" }
 * ```
 */
export function resolveFileKind({ filename, mime }: ResolveFileKindInput): FileKind {
  const media = resolveMediaType({ mime, src: filename });
  if (media !== "unknown") return { kind: "media", mediaKind: media };
  return { kind: "text", language: languageFromFilename(filename) };
}
