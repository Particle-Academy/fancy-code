import { resolveMediaType, type MediaKind } from "@particle-academy/react-fancy";

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

/**
 * Filename/MIME extension → fancy-code language id (a registered alias). Only
 * languages with a tokenizer are mapped; anything else falls through to
 * `"plaintext"`, which renders as un-highlighted text. SVG is intentionally
 * absent — it resolves to a media image, not text.
 */
const EXT_LANGUAGE: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  json: "javascript", // the JS tokenizer highlights JSON acceptably
  jsonc: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "typescript",
  html: "html",
  htm: "html",
  xml: "html",
  xhtml: "html",
  vue: "html",
  php: "php",
  phtml: "php",
  py: "python",
  pyw: "python",
  go: "go",
  md: "markdown",
  markdown: "markdown",
  mkd: "markdown",
  mdx: "markdown",
};

/** Last path segment of a filename/URL, ignoring any query/hash. */
function basename(filename: string): string {
  return filename.split(/[?#]/, 1)[0].split(/[\\/]/).pop() ?? "";
}

/**
 * Resolve the fancy-code editor language for a filename. Returns `"plaintext"`
 * (no syntax highlighting) for unknown or extension-less files.
 */
export function languageFromFilename(filename?: string): string {
  if (!filename) return "plaintext";
  const seg = basename(filename);
  const dot = seg.lastIndexOf(".");
  if (dot <= 0) return "plaintext"; // no extension, or a dotfile like `.gitignore`
  const ext = seg.slice(dot + 1).toLowerCase();
  return EXT_LANGUAGE[ext] ?? "plaintext";
}

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
