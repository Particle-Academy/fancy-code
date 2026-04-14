# @particle-academy/fancy-code

Lightweight embedded code editor with syntax highlighting, custom toolbar buttons, and extensible language and theme registries. Part of the `@particle-academy` component ecosystem.

## Installation

```bash
npm install @particle-academy/fancy-code
# or: pnpm add @particle-academy/fancy-code
# or: yarn add @particle-academy/fancy-code
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `@particle-academy/react-fancy >= 1.5`

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

## Documentation

| Topic | Doc |
|-------|-----|
| Full component API (props, sub-components, `useCodeEditor` hook) | [docs/CodeEditor.md](./docs/CodeEditor.md) |
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

## License

MIT
