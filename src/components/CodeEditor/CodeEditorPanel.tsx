import { cn } from "@particle-academy/react-fancy";
import { useCodeEditor } from "./CodeEditor.context";
import type { CodeEditorPanelProps } from "./CodeEditor.types";

export function CodeEditorPanel({ className }: CodeEditorPanelProps) {
  const { _containerRef } = useCodeEditor();

  return (
    <div
      data-fancy-code-panel=""
      ref={_containerRef}
      className={cn("text-sm", className)}
    />
  );
}

CodeEditorPanel.displayName = "CodeEditorPanel";
