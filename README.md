# @particle-academy/fancy-code

[![Fancified](art/fancified.svg)](https://particle.academy)

Lightweight embedded code editor with syntax highlighting, custom toolbar buttons, and extensible language and theme registries. Part of the `@particle-academy` component ecosystem.

## Installation

```bash
npm install @particle-academy/fancy-code
# or: pnpm add @particle-academy/fancy-code
# or: yarn add @particle-academy/fancy-code
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `@particle-academy/react-fancy >= 4.9` (the `FileViewer` delegates media to react-fancy's `<MediaViewer>`, added in 4.9)

## Setup

Add the package styles to your main CSS (Tailwind v4 scans via `@source`):

```css
@import "tailwindcss";
@import "@particle-academy/fancy-code/styles.css";
@source "../node_modules/@particle-academy/fancy-code/dist/**/*.js";
```

## Quick Start

```tsx
import { CodeEditor } from "@particle-academy/fancy-code";

function App() {
  const [code, setCode] = useState('console.log("Hello");');

  return (
    <CodeEditor value={code} onChange={setCode} language="javascript">
      <CodeEditor.Toolbar />
      <CodeEditor.Panel />
      <CodeEditor.StatusBar />
    </CodeEditor>
  );
}
```

The component ships with no default border or rounding — add your own via `className` for standalone use, or embed directly into IDE layouts without visual conflicts.

## Unified file viewer

Showing arbitrary files from a tree? `FileViewer` renders text in the
`CodeEditor` and delegates **media** (image / video / audio / PDF) to
react-fancy's `<MediaViewer>` — so an image no longer renders as binary text.

```tsx
import { FileViewer } from "@particle-academy/fancy-code";

// text → CodeEditor (read-only, language picked from the filename)
<FileViewer filename="app.tsx" value={source} />

// media → <MediaViewer> (pass the file URL as `src`)
<FileViewer filename="logo.png" src={url} style={{ height: 360 }} />
```

Need to branch your own chrome (tabs, save buttons)? Call `resolveFileKind`
yourself — it's the same text-vs-media decision `FileViewer` makes internally:

```tsx
import { resolveFileKind } from "@particle-academy/fancy-code";

resolveFileKind({ filename: "logo.png" }); // { kind: "media", mediaKind: "image" }
resolveFileKind({ filename: "app.tsx" });   // { kind: "text", language: "typescript" }
```

## Documentation

| Topic | Doc |
|-------|-----|
| Full component API (props, sub-components, `useCodeEditor` hook) | [docs/CodeEditor.md](./docs/CodeEditor.md) |
| Unified file viewer (text + media), `resolveFileKind` | [docs/FileViewer.md](./docs/FileViewer.md) |
| Built-in languages + registering custom ones | [docs/languages.md](./docs/languages.md) |
| Built-in themes + custom theme registration | [docs/themes.md](./docs/themes.md) |

## Commands

```bash
pnpm --filter @particle-academy/fancy-code build    # Build with tsup (ESM + CJS + DTS)
pnpm --filter @particle-academy/fancy-code dev      # Watch mode
pnpm --filter @particle-academy/fancy-code lint     # Type-check (tsc --noEmit)
pnpm --filter @particle-academy/fancy-code clean    # Remove dist/
```

## At a Glance

- **5 public exports** — `CodeEditor` (+ `Toolbar`, `Toolbar.Separator`, `Panel`, `StatusBar`) and the `useCodeEditor` hook
- **6 built-in languages** — JavaScript, TypeScript, HTML, PHP, Python, Go
- **3 built-in themes** — `light`, `dark`, `auto` (follows `prefers-color-scheme`)
- **Zero third-party dependencies** — custom engine, no Monaco / CodeMirror / Shiki
- **IDE-ready** — pairs with `TreeNav` from `@particle-academy/react-fancy` for full IDE layouts; see [docs/CodeEditor.md](./docs/CodeEditor.md) for an example.

## Inertia.js integration

CodeEditor mounts its own DOM observers and is **not SSR-safe**. In an Inertia app, wrap with [`<FancyClientOnly>`](https://github.com/Particle-Academy/fancy-inertia/blob/main/docs/USAGE.md#fancyclientonly) from `@particle-academy/fancy-inertia`:

```tsx
import { FancyClientOnly } from "@particle-academy/fancy-inertia";
import { CodeEditor } from "@particle-academy/fancy-code";

<FancyClientOnly fallback={<div className="h-96 animate-pulse rounded bg-zinc-100" />}>
  <CodeEditor value={code} onChange={setCode} language="typescript" />
</FancyClientOnly>
```

## License

MIT

---

## ⭐ Star Fancy UI

If this package is useful to you, a quick ⭐ on the repo really helps us build a better kit. Thank you!
