# Languages

The editor ships with six built-in language tokenizers. Registering new languages is a single function call.

## Built-in Languages

| Language | Primary name | Aliases |
|----------|--------------|---------|
| JavaScript | `"javascript"` | `"js"`, `"jsx"` |
| TypeScript | `"typescript"` | `"ts"`, `"tsx"` |
| HTML | `"html"` | `"htm"` |
| PHP | `"php"` | — |
| Python | `"python"` | `"py"` |
| Go | `"go"` | `"golang"` |

All built-in languages are auto-registered on import of `@particle-academy/fancy-code`. Use them by passing the name to the `language` prop:

```tsx
<CodeEditor language="typescript" defaultValue={tsCode}>
  <CodeEditor.Panel />
</CodeEditor>
```

## Registering a Custom Language

```tsx
import { registerLanguage } from "@particle-academy/fancy-code";

registerLanguage({
  name: "sql",
  aliases: ["mysql", "postgres"],
  tokenize: (line) => {
    // Return an array of { type, value } tokens for one line.
    // `type` can be any theme token key (e.g., "keyword", "string", "number", "comment").
    return [
      { type: "keyword", value: "SELECT" },
      { type: "plain", value: " * FROM users" },
    ];
  },
});
```

Call `registerLanguage` once at app startup (typically in a `setup-languages.ts` file imported from `main.tsx`).

## Changing Language at Runtime

The built-in toolbar includes a language selector. You can also drive it programmatically:

```tsx
function LangPicker() {
  const { language, setLanguage } = useCodeEditor();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="javascript">JS</option>
      <option value="typescript">TS</option>
      <option value="python">Python</option>
    </select>
  );
}
```

## Tokenization Model

The engine tokenizes one line at a time — this keeps it fast on large files and avoids the complexity of a full AST-based highlighter. Token types map to theme keys: a theme defines colors per token type, and the engine renders accordingly. See [themes](./themes.md) for the token key list each theme must cover.
