# FileViewer

A unified file viewer. Detects whether a file is **text** or **media** and
renders the right surface:

- **text** → a read-only `CodeEditor` with syntax highlighting picked from the
  filename.
- **media** (image / video / audio / PDF) → react-fancy's [`<MediaViewer>`](https://github.com/Particle-Academy/react-fancy/blob/main/docs/MediaViewer.md),
  always read-only.

This solves the "open an image in a code editor and get binary rendered as
text" problem for apps that show arbitrary files from a tree (e.g. an IDE
editor panel built on `CodeEditor` + `TreeNav`).

## Import

```tsx
import { FileViewer } from "@particle-academy/fancy-code";
```

> **Peer requirement:** the media path uses `<MediaViewer>` from
> `@particle-academy/react-fancy` **>= 4.9**.

## Usage

```tsx
// text → CodeEditor (read-only, language from the filename)
<FileViewer filename="app.tsx" value={source} />

// media → <MediaViewer> (give it the file URL via `src`, and a height)
<FileViewer filename="diagram.png" src={url} style={{ height: 360 }} />

// editable text
<FileViewer filename="notes.md" value={md} onChange={setMd} readOnly={false} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| filename | `string` | — | File name / path — drives detection + language, used as label/alt |
| mime | `string` | — | MIME type — preferred over `filename` for detection |
| src | `string` | — | Source URL for **media** files (`http(s):` / `data:` / `blob:`) |
| value | `string` | `""` | Text content for **text** files |
| onChange | `(value: string) => void` | — | Text change handler (ignored when `readOnly`) |
| readOnly | `boolean` | `true` | Read-only. Media is always read-only |
| theme | `string` | `"auto"` | Editor theme for text (`light` / `dark` / `auto` / registered) |
| fileKind | `FileKind` | — | Force the kind, bypassing detection |
| lineNumbers | `boolean` | `true` | Line numbers in the text editor |
| wordWrap | `boolean` | `false` | Wrap long lines in the text editor |
| minHeight / maxHeight | `number` | — | Editor height bounds (px) |
| mediaProps | `Partial<MediaViewerProps>` | — | Extra props forwarded to `<MediaViewer>` |
| className | `string` | — | Classes for the wrapper |
| style | `CSSProperties` | — | Styles for the wrapper (e.g. a height for media) |

The wrapper carries stable handles: `data-fancy-file-viewer`, `data-kind`
(`"text"` / `"media"`), and `data-media-kind` for media.

## `resolveFileKind` / `languageFromFilename`

The detection logic is exported so you can branch your own chrome (tabs, save
buttons, download actions) the same way `FileViewer` does internally.

```ts
import { resolveFileKind, languageFromFilename } from "@particle-academy/fancy-code";

resolveFileKind({ filename: "logo.png" });    // { kind: "media", mediaKind: "image" }
resolveFileKind({ filename: "app.tsx" });      // { kind: "text", language: "typescript" }
resolveFileKind({ mime: "application/pdf" });  // { kind: "media", mediaKind: "pdf" }

languageFromFilename("server.go");             // "go"
languageFromFilename("data.unknown");          // "plaintext"
```

`FileKind` is `{ kind: "text"; language: string } | { kind: "media"; mediaKind: MediaKind }`.
MIME wins over the filename when both are given. Text files with no known
extension resolve to the `"plaintext"` language (no highlighting). SVG resolves
to a media **image**, not text.
