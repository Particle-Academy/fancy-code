# @particle-academy/fancy-code

Lightweight embedded code editor with syntax highlighting, custom toolbar buttons, and extensible language/theme registries. Part of the `@particle-academy` component ecosystem.

## Installation

```bash
# npm
npm install @particle-academy/fancy-code

# pnpm
pnpm add @particle-academy/fancy-code

# yarn
yarn add @particle-academy/fancy-code
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `@particle-academy/react-fancy >= 1.5`

## Usage

Add the `@source` directive to your main CSS file so Tailwind v4 scans the component library:

```css
@import "tailwindcss";
@import "@particle-academy/fancy-code/styles.css";
@source "../node_modules/@particle-academy/fancy-code/dist/**/*.js";
```

Then import and use:

```tsx
import { CodeEditor } from "@particle-academy/fancy-code";
import "@particle-academy/fancy-code/styles.css";

function App() {
  const [code, setCode] = useState('console.log("Hello");');

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="javascript"
      className="rounded-xl border border-zinc-200 dark:border-zinc-700"
    >
      <CodeEditor.Toolbar />
      <CodeEditor.Panel />
      <CodeEditor.StatusBar />
    </CodeEditor>
  );
}
```

The component has no default border or rounding — add your own via `className` for standalone use, or embed directly into IDE layouts without visual conflicts.

## Commands

```bash
pnpm --filter @particle-academy/fancy-code build    # Build with tsup (ESM + CJS + DTS)
pnpm --filter @particle-academy/fancy-code dev      # Watch mode
pnpm --filter @particle-academy/fancy-code lint     # Type-check (tsc --noEmit)
pnpm --filter @particle-academy/fancy-code clean    # Remove dist/
```

## Component API

### Compound Components

| Component | Description |
|-----------|-------------|
| `CodeEditor` | Root wrapper — context provider, state management |
| `CodeEditor.Toolbar` | Action bar with default buttons or custom children |
| `CodeEditor.Toolbar.Separator` | Vertical divider between toolbar groups |
| `CodeEditor.Panel` | Code editing surface |
| `CodeEditor.StatusBar` | Cursor position, language, tab size display |

### CodeEditor Props

```ts
interface CodeEditorProps {
  children: ReactNode;
  className?: string;
  value?: string;                  // Controlled value
  defaultValue?: string;           // Uncontrolled initial value
  onChange?: (value: string) => void;
  language?: string;               // Language name or alias (default: "javascript")
  onLanguageChange?: (lang: string) => void;
  theme?: string;                  // "light" | "dark" | "auto" | custom name (default: "auto")
  readOnly?: boolean;              // Default: false
  lineNumbers?: boolean;           // Default: true
  wordWrap?: boolean;              // Default: false
  tabSize?: number;                // Default: 2
  placeholder?: string;
  minHeight?: number;              // Minimum height in px
  maxHeight?: number;              // Max height before scrolling
}
```

### useCodeEditor Hook

Access the editor context from custom toolbar buttons:

```tsx
import { useCodeEditor } from "@particle-academy/fancy-code";
import { Action } from "@particle-academy/react-fancy";

function RunButton() {
  const { getValue } = useCodeEditor();
  return <Action size="xs" onClick={() => run(getValue())}>Run</Action>;
}

<CodeEditor value={code} onChange={setCode} language="javascript">
  <CodeEditor.Toolbar>
    <RunButton />
    <CodeEditor.Toolbar.Separator />
  </CodeEditor.Toolbar>
  <CodeEditor.Panel />
</CodeEditor>
```

**Context value:**

| Method / Property | Description |
|-------------------|-------------|
| `getValue()` | Get current document text |
| `getSelection()` | Get currently selected text |
| `setValue(text)` | Replace entire document |
| `replaceSelection(text)` | Replace current selection |
| `focus()` | Focus the editor |
| `language` | Current language name |
| `setLanguage(name)` | Switch active language |
| `theme` | Current theme name |
| `readOnly` | Whether the editor is read-only |
| `lineNumbers` | Whether line numbers are shown |
| `wordWrap` | Whether word wrap is enabled |
| `tabSize` | Current tab size |
| `toggleWordWrap()` | Toggle word wrap on/off |
| `toggleLineNumbers()` | Toggle line numbers on/off |
| `copyToClipboard()` | Copy entire document to clipboard |
| `cursorPosition` | `{ line, col }` — current cursor position |
| `selectionLength` | Length of current selection (0 if none) |

## Examples

### Basic Editor

```tsx
<CodeEditor value={code} onChange={setCode} language="typescript">
  <CodeEditor.Toolbar />
  <CodeEditor.Panel />
  <CodeEditor.StatusBar />
</CodeEditor>
```

### Read-Only Code Display

```tsx
<CodeEditor value={snippet} language="php" readOnly>
  <CodeEditor.Panel />
</CodeEditor>
```

### Custom Toolbar

```tsx
<CodeEditor value={code} onChange={setCode} language="javascript">
  <CodeEditor.Toolbar>
    <RunButton />
    <CodeEditor.Toolbar.Separator />
    <FormatButton />
    <CopyButton />
  </CodeEditor.Toolbar>
  <CodeEditor.Panel />
  <CodeEditor.StatusBar />
</CodeEditor>
```

### Height Constraints

```tsx
<CodeEditor value={longCode} language="javascript" maxHeight={400} minHeight={200}>
  <CodeEditor.Toolbar />
  <CodeEditor.Panel />
  <CodeEditor.StatusBar />
</CodeEditor>
```

### Minimal (No Toolbar, No StatusBar)

```tsx
<CodeEditor value={snippet} language="javascript" readOnly lineNumbers={false}>
  <CodeEditor.Panel />
</CodeEditor>
```

## Built-in Languages

| Language | Aliases |
|----------|---------|
| JavaScript | `js`, `javascript`, `jsx` |
| TypeScript | `ts`, `typescript`, `tsx` |
| HTML | `html`, `htm` |
| PHP | `php` |

## Custom Language Registration

Add languages beyond the four built-ins using `registerLanguage`:

```tsx
import { registerLanguage } from "@particle-academy/fancy-code";

registerLanguage({
  name: "Python",
  aliases: ["py", "python"],
  support: () => {
    // Return a LanguageSupport instance
    const { python } = require("@codemirror/lang-python");
    return python();
  },
});

// Lazy-loaded
registerLanguage({
  name: "Rust",
  aliases: ["rs", "rust"],
  support: async () => {
    const { rust } = await import("@codemirror/lang-rust");
    return rust();
  },
});
```

Then use it:

```tsx
<CodeEditor language="python" ... />
```

## Built-in Color Schemes

| Theme | Description |
|-------|-------------|
| `light` | White background, blue/purple/green token colors |
| `dark` | Zinc-900 background, pastel token colors |
| `auto` | Automatically selects light/dark based on `prefers-color-scheme` (default) |

## Custom Theme Registration

Create custom syntax highlighting color schemes using `registerTheme`:

```tsx
import { registerTheme } from "@particle-academy/fancy-code";

registerTheme({
  name: "monokai",
  variant: "dark",
  editorTheme: /* editor chrome styles (background, gutter, cursor, selection) */,
  highlightStyle: /* token color definitions (keywords, strings, comments, etc.) */,
});
```

Then use it:

```tsx
<CodeEditor theme="monokai" ... />
```

**Theme definition:**

```ts
interface ThemeDefinition {
  name: string;                    // Unique theme name
  variant: "light" | "dark";      // Light or dark base
  editorTheme: Extension;         // Editor chrome styles (gutter, cursor, selection)
  highlightStyle: HighlightStyle; // Syntax token color definitions
}
```

## Built-in Features

- Syntax highlighting with language-aware tokenization
- Line numbers with active line gutter highlight
- Active line highlighting
- Bracket matching and auto-close
- Code folding with fold gutter
- Search and replace (Ctrl+F / Cmd+F)
- Autocompletion
- History (undo/redo)
- Indent on input
- Selection highlighting
- Tab key indentation

All features are reconfigurable at runtime — switching languages, themes, line numbers, word wrap, tab size, and read-only mode happens without recreating the editor.

## Customization

All components render `data-fancy-code-*` attributes on their root elements for external CSS targeting:

| Attribute | Element |
|-----------|---------|
| `data-fancy-code-editor` | Root wrapper |
| `data-fancy-code-toolbar` | Toolbar bar |
| `data-fancy-code-toolbar-separator` | Toolbar separator |
| `data-fancy-code-panel` | Editing surface |
| `data-fancy-code-statusbar` | Status bar |

## Architecture

### Directory Layout

```
src/
├── components/
│   └── CodeEditor/
│       ├── CodeEditor.tsx              # Root compound component + context
│       ├── CodeEditor.types.ts         # All prop/context types
│       ├── CodeEditor.context.ts       # React context + useCodeEditor hook
│       ├── CodeEditorPanel.tsx         # Editing surface
│       ├── CodeEditorToolbar.tsx       # Default toolbar + custom children
│       ├── CodeEditorToolbarSeparator.tsx
│       ├── CodeEditorStatusBar.tsx     # Cursor/language/tab display
│       └── index.ts
├── hooks/
│   ├── use-codemirror.ts               # Core editor lifecycle
│   └── use-dark-mode.ts               # Reactive prefers-color-scheme
├── languages/
│   ├── registry.ts                     # Global language registry
│   ├── builtin.ts                     # JS, TS, HTML, PHP registrations
│   ├── types.ts                       # LanguageDefinition type
│   └── index.ts
├── themes/
│   ├── registry.ts                     # Global theme registry
│   ├── light.ts                       # Built-in light color scheme
│   ├── dark.ts                        # Built-in dark color scheme
│   ├── types.ts                       # ThemeDefinition type
│   └── index.ts
├── styles.css                         # Base structural styles
└── index.ts                           # Public API
```

### Public Exports

```ts
// Components
export { CodeEditor, useCodeEditor };
export type { CodeEditorProps, CodeEditorContextValue, CodeEditorToolbarProps, CodeEditorPanelProps, CodeEditorStatusBarProps };

// Language registration
export { registerLanguage, getLanguage, getRegisteredLanguages };
export type { LanguageDefinition };

// Theme registration
export { registerTheme, getTheme, getRegisteredThemes };
export type { ThemeDefinition };
```

## Demo Pages

The demo page lives in the monorepo at `resources/js/react-demos/pages/CodeEditorDemo.tsx` and is accessible at `/react-demos/code-editor`. It demonstrates:

1. Basic editor with default toolbar
2. Read-only code display
3. Custom toolbar buttons via `useCodeEditor()`
4. Language switching (JS, TS, HTML, PHP)
5. Light vs dark theme showcase
6. Word wrap and configuration
7. Minimal mode (no toolbar, no status bar)

---

## Agent Guidelines

Guidelines for AI agents (Claude Code, Copilot, etc.) working on this package.

### Component Pattern

- Uses the same compound component pattern as `@particle-academy/react-fancy`'s Editor: `Object.assign(Root, { Toolbar, Panel, StatusBar })`.
- Context is provided via `CodeEditorContext` and consumed with `useCodeEditor()`.
- All root elements have `data-fancy-code-*` attributes for external CSS targeting.

### Editor Engine

- The `useCodemirror` hook manages the editor lifecycle.
- Uses compartments for hot-swapping language, theme, line numbers, word wrap, tab size, read-only, placeholder, and height constraints.
- External value changes are synced via `isExternalUpdate` ref to prevent onChange loops.
- SSR-safe: the editor is only created inside `useEffect`.

### Extension System

- Languages and themes use the same global registry pattern as react-fancy's `registerExtension`.
- Built-in languages/themes are registered via side-effect imports in `languages/builtin.ts` and `themes/light.ts`/`themes/dark.ts`.
- The `sideEffects` field in `package.json` lists these files to prevent tree-shaking.

### Build

- tsup handles the build — ESM, CJS, and `.d.ts` generation.
- `react`, `react-dom`, and `@particle-academy/react-fancy` are external dependencies.
- All editor engine packages are **bundled** (not external) so consumers don't need to install them.
- After any change, verify with `npm run build` from the monorepo root.
