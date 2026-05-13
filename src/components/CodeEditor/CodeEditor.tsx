import { useMemo, useRef, useState, useCallback } from "react";
import { cn, useControllableState } from "@particle-academy/react-fancy";
import { CodeEditorContext } from "./CodeEditor.context";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { CodeEditorToolbar } from "./CodeEditorToolbar";
import { CodeEditorToolbarSeparator } from "./CodeEditorToolbarSeparator";
import { CodeEditorStatusBar } from "./CodeEditorStatusBar";
import { useEditorEngine } from "../../hooks/use-editor-engine";
import { useDarkMode } from "../../hooks/use-dark-mode";
import { getLanguage } from "../../languages";
import type { CodeEditorProps, CodeEditorContextValue } from "./CodeEditor.types";

function CodeEditorRoot({
  children,
  className,
  value: valueProp,
  defaultValue = "",
  onChange,
  language: languageProp = "javascript",
  onLanguageChange,
  theme = "auto",
  readOnly = false,
  lineNumbers: lineNumbersProp = true,
  wordWrap: wordWrapProp = false,
  tabSize: tabSizeProp = 2,
  placeholder,
  minHeight,
  maxHeight,
}: CodeEditorProps) {
  const [currentValue, setCurrentValue] = useControllableState(valueProp, defaultValue, onChange);

  // Reactive dark mode for "auto" theme
  const isDark = useDarkMode();
  const resolvedTheme = theme === "auto" ? (isDark ? "dark" : "light") : theme;

  // Language state (changeable via toolbar selector)
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    const def = getLanguage(languageProp);
    return def?.name ?? languageProp;
  });

  const setLanguage = useCallback(
    (lang: string) => {
      const def = getLanguage(lang);
      const resolved = def?.name ?? lang;
      setCurrentLanguageState(resolved);
      onLanguageChange?.(resolved);
    },
    [onLanguageChange],
  );

  // Toggle states
  const [showLineNumbers, setShowLineNumbers] = useState(lineNumbersProp);
  const [isWordWrap, setIsWordWrap] = useState(wordWrapProp);

  // Cursor position
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [selectionLength, setSelectionLength] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Our custom editor engine
  const engineReturn = useEditorEngine({
    containerRef,
    value: currentValue,
    onChange: setCurrentValue,
    language: currentLanguage,
    theme: resolvedTheme,
    readOnly,
    lineNumbers: showLineNumbers,
    wordWrap: isWordWrap,
    tabSize: tabSizeProp,
    placeholder,
    minHeight,
    maxHeight,
    onCursorChange: ({ line, col, selectionLength: sel }) => {
      setCursorPosition({ line, col });
      setSelectionLength(sel);
    },
  });

  const contextValue = useMemo<CodeEditorContextValue>(
    () => ({
      getValue: () => engineReturn.textareaRef.current?.value ?? currentValue,
      getSelection: () => {
        const ta = engineReturn.textareaRef.current;
        if (!ta) return "";
        return ta.value.slice(ta.selectionStart, ta.selectionEnd);
      },
      setValue: (v: string) => setCurrentValue(v),
      replaceSelection: (text: string) => {
        const ta = engineReturn.textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = ta.value.slice(0, start);
        const after = ta.value.slice(end);
        ta.value = before + text + after;
        ta.selectionStart = ta.selectionEnd = start + text.length;
        setCurrentValue(ta.value);
      },
      focus: () => engineReturn.textareaRef.current?.focus(),
      language: currentLanguage,
      setLanguage,
      theme: resolvedTheme,
      readOnly,
      lineNumbers: showLineNumbers,
      wordWrap: isWordWrap,
      tabSize: tabSizeProp,
      toggleWordWrap: () => setIsWordWrap((w) => !w),
      toggleLineNumbers: () => setShowLineNumbers((l) => !l),
      copyToClipboard: async () => {
        const text = engineReturn.textareaRef.current?.value ?? currentValue;
        await navigator.clipboard.writeText(text);
      },
      cursorPosition,
      selectionLength,
      textareaRef: engineReturn.textareaRef,
      placeholder,
      _engineReturn: engineReturn,
      _minHeight: minHeight,
      _maxHeight: maxHeight,
    }),
    [engineReturn, currentValue, currentLanguage, setLanguage, resolvedTheme, readOnly, showLineNumbers, isWordWrap, tabSizeProp, cursorPosition, selectionLength, setCurrentValue, placeholder, minHeight, maxHeight],
  );

  return (
    <CodeEditorContext.Provider value={contextValue}>
      <div
        data-fancy-code-editor=""
        className={cn(
          "overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
    </CodeEditorContext.Provider>
  );
}

CodeEditorRoot.displayName = "CodeEditor";

const ToolbarWithSeparator = Object.assign(CodeEditorToolbar, {
  Separator: CodeEditorToolbarSeparator,
});

export const CodeEditor = Object.assign(CodeEditorRoot, {
  Toolbar: ToolbarWithSeparator,
  Panel: CodeEditorPanel,
  StatusBar: CodeEditorStatusBar,
});
