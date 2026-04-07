import { cn } from "@particle-academy/react-fancy";
import { useCodeEditor } from "./CodeEditor.context";
import type { CodeEditorStatusBarProps } from "./CodeEditor.types";

export function CodeEditorStatusBar({ children, className }: CodeEditorStatusBarProps) {
  const { cursorPosition, selectionLength, language, tabSize } = useCodeEditor();

  return (
    <div
      data-fancy-code-statusbar=""
      className={cn(
        "flex items-center gap-3 border-t border-zinc-200 px-3 py-1 text-[11px] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400",
        className,
      )}
    >
      {children ?? (
        <>
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
          {selectionLength > 0 && <span>{selectionLength} selected</span>}
          <span className="ml-auto">{language}</span>
          <span>{tabSize} spaces</span>
        </>
      )}
    </div>
  );
}

CodeEditorStatusBar.displayName = "CodeEditorStatusBar";
