import { useMemo } from "react";
import {
  InputTag,
  textareaAdapter,
  type InputTagAdapter,
  type InputTagProps,
  type InputTagTriggers,
} from "@particle-academy/react-fancy";
import { useCodeEditor } from "./components/CodeEditor/CodeEditor.context";

/**
 * Glue between `@particle-academy/react-fancy`'s `<InputTag>` and the
 * `<CodeEditor>` from this package. `<CodeEditor>` renders a real DOM
 * `<textarea>` under its overlay, so the existing `textareaAdapter`
 * just works — this module hands it the right ref via the editor
 * context.
 *
 *   <CodeEditor value={code} onChange={setCode} language="markdown">
 *     <CodeEditor.Toolbar />
 *     <CodeEditor.Panel />
 *     <CodeEditorInputTag
 *       triggers={{
 *         "/": { items: commands, insert: (c) => `${c.name} ` },
 *         "@": { items: mentions, insert: (m) => `@${m.name} ` },
 *       }}
 *     />
 *   </CodeEditor>
 *
 * Must be rendered as a descendant of `<CodeEditor>` (it reads the
 * editor's context). For ad-hoc wiring outside the component tree,
 * pull the textarea ref off the context and call `textareaAdapter`
 * yourself.
 */

/**
 * Hook form — returns an `InputTagAdapter` bound to the surrounding
 * `<CodeEditor>`. Useful when you want to compose your own picker UI
 * around the same adapter.
 */
export function useCodeEditorInputTagAdapter(): InputTagAdapter {
  const ctx = useCodeEditor();
  return useMemo(() => textareaAdapter(ctx.textareaRef), [ctx.textareaRef]);
}

export interface CodeEditorInputTagProps extends Omit<InputTagProps, "adapter"> {
  triggers: InputTagTriggers;
}

/**
 * Convenience wrapper — renders `<InputTag>` already wired to the
 * surrounding `<CodeEditor>`'s textarea. Equivalent to:
 *
 *   const adapter = useCodeEditorInputTagAdapter();
 *   return <InputTag adapter={adapter} {...rest} />;
 */
export function CodeEditorInputTag(props: CodeEditorInputTagProps) {
  const adapter = useCodeEditorInputTagAdapter();
  return <InputTag adapter={adapter} {...props} />;
}
