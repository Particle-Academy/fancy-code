import { createContext, useContext } from "react";
import type { CodeEditorContextValue } from "./CodeEditor.types";

export const CodeEditorContext = createContext<CodeEditorContextValue | null>(null);

export function useCodeEditor(): CodeEditorContextValue {
  const ctx = useContext(CodeEditorContext);
  if (!ctx) {
    throw new Error("useCodeEditor must be used within a <CodeEditor> component");
  }
  return ctx;
}
