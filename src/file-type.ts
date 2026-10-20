import { resolveMediaType, type MediaKind } from "@particle-academy/react-fancy";
import { languageFromFilename } from "@particle-academy/fancy-file-commons";

/**
 * The decision a file viewer makes about a file: render it as editable text, or
 * hand it to a media viewer. `media` carries the resolved {@link MediaKind};
 * `text` carries the editor language id.
 */
export type FileKind =
  | { kind: "text"; language: string }
  | { kind: "media"; mediaKind: MediaKind }
  /** Read as a reader sees it (rendered), not as source. `language` is for the source view. */
  | { kind: "document"; format: DocumentFormat; language: string }
  /** An Office file: binary, so never text. */
  | { kind: "office"; officeKind: OfficeKind };

export type DocumentFormat = "markdown" | "html" | "text";
export type OfficeKind = "docx" | "xlsx" | "pptx";

const OFFICE_EXT: Record<string, OfficeKind> = { docx: "docx", xlsx: "xlsx", xlsm: "xlsx", pptx: "pptx" };
const OFFICE_MIME: Record<string, OfficeKind> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};
// By extension, not by editor language: `.xml` and `.vue` share the html
// language for highlighting, and neither is a page to render.
const DOCUMENT_EXT: Record<string, DocumentFormat> = {
  md: "markdown",
  markdown: "markdown",
  html: "html",
  htm: "html",
  txt: "text",
  text: "text",
};
const DOCUMENT_MIME: Record<string, DocumentFormat> = {
  "text/markdown": "markdown",
  "text/x-markdown": "markdown",
  "text/html": "html",
  "text/plain": "text",
};

function extensionOf(filename?: string): string {
  const name = (filename ?? "").split(/[?#]/)[0].split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

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

  const type = (mime ?? "").split(";")[0].trim().toLowerCase();
  const ext = extensionOf(filename);

  const office = OFFICE_MIME[type] ?? OFFICE_EXT[ext];
  if (office) return { kind: "office", officeKind: office };

  const language = languageFromFilename(filename);
  // The extension wins when it names one: hosts label source `text/plain`.
  // A bare MIME decides only when the name says nothing (no filename, or a
  // plain-text one).
  const format = DOCUMENT_EXT[ext] ?? (language === "plaintext" ? DOCUMENT_MIME[type] : undefined);
  if (format) {
    // A text/* MIME with no filename still needs a source-view language.
    const lang = language !== "plaintext" ? language : format === "markdown" ? "markdown" : format === "html" ? "html" : "plaintext";
    return { kind: "document", format, language: lang };
  }

  return { kind: "text", language };
}
