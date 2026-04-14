# Themes

Three built-in themes plus a simple registration API for custom ones.

## Built-in Themes

| Name | Description |
|------|-------------|
| `"light"` | White background, blue/purple/green tokens |
| `"dark"` | Zinc-900 background, pastel tokens |
| `"auto"` | Follows `prefers-color-scheme` — switches between `"light"` and `"dark"` |

All three are auto-registered on import. Use by name:

```tsx
<CodeEditor theme="dark" defaultValue={code}>
  <CodeEditor.Panel />
</CodeEditor>
```

## Registering a Custom Theme

```tsx
import { registerTheme } from "@particle-academy/fancy-code";

registerTheme({
  name: "solarized",
  background: "#fdf6e3",
  foreground: "#586e75",
  gutter: "#eee8d5",
  activeLine: "rgba(147, 161, 161, 0.1)",
  selection: "rgba(181, 137, 0, 0.2)",
  tokens: {
    keyword: "#859900",
    string: "#2aa198",
    number: "#d33682",
    comment: "#93a1a1",
    punctuation: "#586e75",
    operator: "#cb4b16",
    function: "#268bd2",
    type: "#b58900",
    // ...any token type your tokenizers emit
  },
});
```

Call `registerTheme` once at app startup. Then use by name:

```tsx
<CodeEditor theme="solarized">
  <CodeEditor.Panel />
</CodeEditor>
```

## Switching Theme at Runtime

```tsx
function ThemeToggle() {
  const { theme } = useCodeEditor();
  const [dark, setDark] = useState(theme === "dark");
  // drive the `theme` prop from your own state:
  return (
    <button onClick={() => setDark((v) => !v)}>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
```

Since `theme` is controlled via the `CodeEditor` prop, re-render the parent with the new value to switch.

## Token Types

Common token types emitted by built-in tokenizers — register colors for these when creating a theme:

- `keyword` — language keywords (`const`, `function`, `if`, ...)
- `string` — string literals
- `number` — numeric literals
- `comment` — single/multi-line comments
- `operator` — `+`, `===`, `=>`, etc.
- `punctuation` — braces, brackets, semicolons
- `function` — function names and calls
- `type` — type names (TS/Go)
- `tag` — HTML tags
- `attribute` — HTML attributes
- `plain` — anything uncategorized

Unregistered token types fall back to `foreground`.
