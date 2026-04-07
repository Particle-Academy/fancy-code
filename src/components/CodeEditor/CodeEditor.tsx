import { useMemo, useRef, useState, useCallback } from "react";
import { cn, useControllableState } from "@particle-academy/react-fancy";
import { CodeEditorContext } from "./CodeEditor.context";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { CodeEditorToolbar } from "./CodeEditorToolbar";
import { CodeEditorToolbarSeparator } from "./CodeEditorToolbarSeparator";
import { CodeEditorStatusBar } from "./CodeEditorStatusBar";
import { useCodemirror } from "../../hooks/use-codemirror";
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
  extensions: additionalExtensions,
}: CodeEditorProps) {
  const [currentValue, setCurrentValue] = useControllableState(valueProp, defaultValue, onChange);

  // Reactive dark mode for "auto" theme
  const isDark = useDarkMode();
  const resolvedTheme = theme === "auto" ? (isDark ? "dark" : "light") : theme;

  // Language state (changeable via toolbar selector)
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    // Resolve to display name
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

  // Container ref for CodeMirror mount
  const containerRef = useRef<HTMLDivElement>(null);

  // Core CodeMirror hook
  const { view } = useCodemirror({
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
    searchEnabled: true,
    additionalExtensions,
    onCursorChange: ({ line, col, selectionLength: sel }) => {
      setCursorPosition({ line, col });
      setSelectionLength(sel);
    },
  });

  const contextValue = useMemo<CodeEditorContextValue>(
    () => ({
      view,
      getValue: () => view?.state.doc.toString() ?? currentValue,
      getSelection: () => {
        if (!view) return "";
        const sel = view.state.selection.main;
        return view.state.sliceDoc(sel.from, sel.to);
      },
      setValue: (v: string) => setCurrentValue(v),
      replaceSelection: (text: string) => {
        if (!view) return;
        view.dispatch(view.state.replaceSelection(text));
      },
      focus: () => view?.focus(),
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
        const text = view?.state.doc.toString() ?? currentValue;
        await navigator.clipboard.writeText(text);
      },
      cursorPosition,
      selectionLength,
      _containerRef: containerRef,
      _minHeight: minHeight,
      _maxHeight: maxHeight,
    }),
    [view, currentValue, currentLanguage, setLanguage, resolvedTheme, readOnly, showLineNumbers, isWordWrap, tabSizeProp, cursorPosition, selectionLength, setCurrentValue, minHeight, maxHeight],
  );

  return (
    <CodeEditorContext.Provider value={contextValue}>
      <div
        data-fancy-code-editor=""
        className={cn(
          "overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
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
