import { useEffect, useRef, useCallback, useState, useMemo, type RefObject } from "react";
import { getLanguage } from "../languages";
import { getTheme } from "../themes";
import { highlightCode } from "../engine/highlight";
import type { ThemeColors } from "../themes/types";
import type { Tokenizer } from "../engine/tokenizer";

export interface UseEditorEngineOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  value: string;
  onChange?: (value: string) => void;
  language: string;
  theme: string;
  readOnly: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  tabSize: number;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onCursorChange?: (pos: { line: number; col: number; selectionLength: number }) => void;
}

export interface UseEditorEngineReturn {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  highlightedHtml: string;
  lineCount: number;
  activeLine: number;
  themeColors: ThemeColors;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleInput: () => void;
  handleScroll: () => void;
  handleSelect: () => void;
  scrollTop: number;
  scrollLeft: number;
}

const DEFAULT_COLORS: ThemeColors = {
  background: "#18181b",
  foreground: "#e4e4e7",
  gutterBackground: "#18181b",
  gutterForeground: "#52525b",
  gutterBorder: "#27272a",
  activeLineBackground: "#27272a",
  selectionBackground: "#1e3a5f",
  cursorColor: "#60a5fa",
  keyword: "#c084fc",
  string: "#34d399",
  comment: "#71717a",
  number: "#fbbf24",
  operator: "#22d3ee",
  function: "#60a5fa",
  type: "#fbbf24",
  tag: "#f87171",
  attribute: "#fbbf24",
  attributeValue: "#34d399",
  punctuation: "#a1a1aa",
  variable: "#e4e4e7",
};

export function useEditorEngine({
  value,
  onChange,
  language,
  theme,
  readOnly,
  wordWrap,
  tabSize,
  onCursorChange,
}: UseEditorEngineOptions): UseEditorEngineReturn {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeLine, setActiveLine] = useState(1);

  // Resolve theme colors
  const themeColors = useMemo<ThemeColors>(() => {
    const def = getTheme(theme);
    return def?.colors ?? DEFAULT_COLORS;
  }, [theme]);

  // Resolve tokenizer
  const tokenizer = useMemo<Tokenizer | null>(() => {
    const def = getLanguage(language);
    return def?.tokenize ?? null;
  }, [language]);

  // Generate highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!tokenizer) {
      // No tokenizer — just escape HTML
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
    const tokens = tokenizer(value);
    return highlightCode(value, tokens, themeColors);
  }, [value, tokenizer, themeColors]);

  const lineCount = useMemo(() => {
    let count = 1;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "\n") count++;
    }
    return count;
  }, [value]);

  // Auto-resize textarea to match content so caret is always visible
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";

    if (!wordWrap) {
      // Shrink to 0 to measure true content width, then expand
      ta.style.width = "0";
      ta.style.width = ta.scrollWidth + "px";
    } else {
      ta.style.width = "";
    }
  }, [wordWrap]);

  // Sync textarea value and auto-resize when value changes
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (ta.value !== value) {
      const { selectionStart, selectionEnd } = ta;
      ta.value = value;
      ta.selectionStart = selectionStart;
      ta.selectionEnd = selectionEnd;
    }
    // Always resize — handles initial mount and external value changes
    autoResize();
  }, [value, autoResize]);

  const updateCursorInfo = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = ta.value.slice(0, pos);
    const line = (textBefore.match(/\n/g) || []).length + 1;
    const lastNewline = textBefore.lastIndexOf("\n");
    const col = pos - lastNewline;
    const selLen = Math.abs(ta.selectionEnd - ta.selectionStart);
    setActiveLine(line);
    onCursorChangeRef.current?.({ line, col, selectionLength: selLen });
  }, []);

  const handleInput = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    onChangeRef.current?.(ta.value);
    autoResize();
    updateCursorInfo();
  }, [autoResize, updateCursorInfo]);

  const handleSelect = useCallback(() => {
    updateCursorInfo();
  }, [updateCursorInfo]);

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    setScrollTop(ta.scrollTop);
    setScrollLeft(ta.scrollLeft);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) {
        // Allow copy shortcuts in read-only mode
        if (e.key === "c" && (e.metaKey || e.ctrlKey)) return;
        if (e.key === "a" && (e.metaKey || e.ctrlKey)) return;
        e.preventDefault();
        return;
      }

      // Tab key — insert spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const spaces = " ".repeat(tabSize);

        if (e.shiftKey) {
          // Dedent: remove leading spaces from selected lines
          const lines = ta.value.split("\n");
          const startLine = ta.value.slice(0, start).split("\n").length - 1;
          const endLine = ta.value.slice(0, end).split("\n").length - 1;
          let removed = 0;
          for (let i = startLine; i <= endLine; i++) {
            const match = lines[i].match(new RegExp(`^ {1,${tabSize}}`));
            if (match) {
              removed += match[0].length;
              lines[i] = lines[i].slice(match[0].length);
            }
          }
          const newValue = lines.join("\n");
          ta.value = newValue;
          ta.selectionStart = Math.max(0, start - (startLine === endLine ? removed : tabSize));
          ta.selectionEnd = Math.max(0, end - removed);
          onChangeRef.current?.(newValue);
        } else if (start !== end) {
          // Indent selected lines
          const lines = ta.value.split("\n");
          const startLine = ta.value.slice(0, start).split("\n").length - 1;
          const endLine = ta.value.slice(0, end).split("\n").length - 1;
          for (let i = startLine; i <= endLine; i++) {
            lines[i] = spaces + lines[i];
          }
          const newValue = lines.join("\n");
          ta.value = newValue;
          ta.selectionStart = start + tabSize;
          ta.selectionEnd = end + (endLine - startLine + 1) * tabSize;
          onChangeRef.current?.(newValue);
        } else {
          // Insert tab at cursor
          const before = ta.value.slice(0, start);
          const after = ta.value.slice(end);
          ta.value = before + spaces + after;
          ta.selectionStart = ta.selectionEnd = start + tabSize;
          onChangeRef.current?.(ta.value);
        }
        autoResize();
        updateCursorInfo();
        return;
      }

      // Enter — auto-indent
      if (e.key === "Enter") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = ta.value.slice(0, start);
        const after = ta.value.slice(end);
        const currentLine = before.split("\n").pop() || "";
        const indent = currentLine.match(/^(\s*)/)?.[1] || "";

        // Extra indent after { or (
        const lastChar = before.trimEnd().slice(-1);
        const extraIndent = (lastChar === "{" || lastChar === "(") ? " ".repeat(tabSize) : "";

        const insertion = "\n" + indent + extraIndent;
        ta.value = before + insertion + after;
        ta.selectionStart = ta.selectionEnd = start + insertion.length;
        onChangeRef.current?.(ta.value);
        autoResize();
        updateCursorInfo();
        return;
      }
    },
    [readOnly, tabSize, autoResize, updateCursorInfo],
  );

  return {
    textareaRef,
    highlightedHtml,
    lineCount,
    activeLine,
    themeColors,
    handleKeyDown,
    handleInput,
    handleScroll,
    handleSelect,
    scrollTop,
    scrollLeft,
  };
}
