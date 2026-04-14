# CodeEditor

A compound code editor built on a custom lightweight engine (no Monaco / CodeMirror dependency). Supports syntax highlighting, line numbers, word wrap, placeholder, read-only mode, height constraints, and swappable languages and themes.

## Import

```tsx
import {
  CodeEditor,
  useCodeEditor,
} from "@particle-academy/fancy-code";
import "@particle-academy/fancy-code/styles.css";
```

## Basic Usage

```tsx
<CodeEditor
  defaultValue={`function greet(name) {\n  return "Hello, " + name;\n}`}
  language="javascript"
>
  <CodeEditor.Toolbar />
  <CodeEditor.Panel />
  <CodeEditor.StatusBar />
</CodeEditor>
```

All three sub-components are optional — omit any to render a minimal editor.

## Props

### CodeEditor (root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | Controlled document text |
| defaultValue | `string` | `""` | Initial document text (uncontrolled) |
| onChange | `(value: string) => void` | - | Called on every document change |
| language | `string` | `"javascript"` | Language name or alias (see [languages](./languages.md)) |
| onLanguageChange | `(lang: string) => void` | - | Called when the toolbar language selector changes |
| theme | `string` | `"auto"` | `"light"`, `"dark"`, `"auto"`, or a registered custom theme |
| readOnly | `boolean` | `false` | Disable editing |
| lineNumbers | `boolean` | `true` | Show the gutter with line numbers |
| wordWrap | `boolean` | `false` | Wrap long lines instead of horizontal scroll |
| tabSize | `number` | `2` | Number of spaces per tab |
| placeholder | `string` | - | Shown when the document is empty |
| minHeight | `number` | - | Minimum height in px |
| maxHeight | `number` | - | Maximum height in px (scrolls beyond) |
| className | `string` | - | Additional CSS classes on the root container |

### CodeEditor.Toolbar

Default-rendered toolbar with language selector, word-wrap toggle, and copy button. Pass `children` to replace the defaults.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Custom toolbar content (replaces defaults) |
| className | `string` | - | Additional CSS classes |

### CodeEditor.Toolbar.Separator

Vertical divider between toolbar groups. No props.

### CodeEditor.Panel

The editable code surface.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | `string` | - | Additional CSS classes |

### CodeEditor.StatusBar

Default footer showing cursor line/col, selection count, language name, and tab size. Pass `children` to replace.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Custom status bar content (replaces defaults) |
| className | `string` | - | Additional CSS classes |

## useCodeEditor Hook

Access editor state and commands from any child of `<CodeEditor>`. Typically used inside a custom toolbar.

```tsx
import { useCodeEditor } from "@particle-academy/fancy-code";

function RunButton() {
  const { getValue } = useCodeEditor();

  return (
    <button onClick={() => eval(getValue())}>Run</button>
  );
}
```

### CodeEditorContextValue

| Property | Type | Description |
|----------|------|-------------|
| getValue | `() => string` | Current document text |
| getSelection | `() => string` | Currently selected text |
| setValue | `(value: string) => void` | Replace the entire document |
| replaceSelection | `(text: string) => void` | Replace the current selection |
| focus | `() => void` | Focus the editor |
| language | `string` | Current language name |
| setLanguage | `(lang: string) => void` | Change the active language |
| theme | `string` | Current theme name |
| readOnly | `boolean` | Whether editing is disabled |
| lineNumbers | `boolean` | Whether the gutter is shown |
| wordWrap | `boolean` | Whether word wrap is enabled |
| tabSize | `number` | Current tab size |
| toggleWordWrap | `() => void` | Toggle wordWrap on/off |
| toggleLineNumbers | `() => void` | Toggle lineNumbers on/off |
| copyToClipboard | `() => Promise<void>` | Copy the full document |
| cursorPosition | `{ line: number; col: number }` | Current cursor position |
| selectionLength | `number` | Length of current selection (0 if none) |
| placeholder | `string \| undefined` | Placeholder text |

## Controlled Usage

```tsx
const [code, setCode] = useState("");

<CodeEditor value={code} onChange={setCode} language="typescript">
  <CodeEditor.Panel />
</CodeEditor>
```

## Read-Only Display

```tsx
<CodeEditor defaultValue={someSnippet} language="php" readOnly>
  <CodeEditor.Toolbar />
  <CodeEditor.Panel />
</CodeEditor>
```

## Height Constraints

```tsx
<CodeEditor defaultValue={longFile} minHeight={200} maxHeight={500}>
  <CodeEditor.Toolbar />
  <CodeEditor.Panel />
</CodeEditor>
```

When content exceeds `maxHeight`, the panel becomes scrollable.

## Custom Toolbar

```tsx
function FormatButton() {
  const { getValue, setValue } = useCodeEditor();

  return (
    <button onClick={() => setValue(getValue().trim())}>
      Trim
    </button>
  );
}

<CodeEditor defaultValue="  hello  ">
  <CodeEditor.Toolbar>
    <FormatButton />
    <CodeEditor.Toolbar.Separator />
    {/* Drop in your own widgets — no defaults are rendered when children are provided */}
  </CodeEditor.Toolbar>
  <CodeEditor.Panel />
</CodeEditor>
```

## IDE Layout (pair with TreeNav)

```tsx
import { TreeNav } from "@particle-academy/react-fancy";
import { CodeEditor } from "@particle-academy/fancy-code";

<div className="flex" style={{ height: 600 }}>
  <div className="w-56 shrink-0 overflow-y-auto border-r p-2">
    <TreeNav nodes={fileTree} selectedId={activeFile} onSelect={openFile} />
  </div>
  <div className="flex-1">
    <CodeEditor value={code} onChange={setCode} language={lang}>
      <CodeEditor.Toolbar />
      <CodeEditor.Panel />
      <CodeEditor.StatusBar />
    </CodeEditor>
  </div>
</div>
```

## Data Attributes

| Attribute | Element |
|-----------|---------|
| `data-fancy-code-editor` | Root container |
| `data-fancy-code-toolbar` | Toolbar |
| `data-fancy-code-toolbar-separator` | Toolbar separator |
| `data-fancy-code-panel` | Editable surface |
| `data-fancy-code-statusbar` | Status bar |

Use these to target editor parts in your own CSS without reaching into internal classes.

## See Also

- [Languages](./languages.md) — built-in languages and how to register custom ones
- [Themes](./themes.md) — built-in themes and custom theme registration
