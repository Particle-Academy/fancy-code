import { useMemo } from "react";
import { cn } from "@particle-academy/react-fancy";
import { useCodeEditor } from "./CodeEditor.context";
import {
  diffMarkColor,
  diffRemovedColor,
  gutterDiffMark,
  hasDeletedAtEnd,
} from "./diff-gutter";
import type { CodeEditorPanelProps } from "./CodeEditor.types";

export function CodeEditorPanel({ className }: CodeEditorPanelProps) {
  const {
    _engineReturn: engine,
    lineNumbers,
    wordWrap,
    readOnly,
    placeholder,
    _diffAnnotations: diffAnnotations,
    _maxHeight,
    _minHeight,
  } = useCodeEditor();

  // This `useMemo` MUST run before the `!engine` guard below it.
  //
  // The guard used to come first, so a render without an engine ran ZERO hooks
  // and the next one ran one. React compares hook counts between renders, so
  // that transition desyncs the hook order and throws from deep inside React,
  // naming none of this code. `_engineReturn` is typed `| null` and starts null,
  // so the transition is real rather than theoretical.
  //
  // Reading the engine's fields inside the callback (rather than destructuring
  // above) is what lets the hook run unconditionally.
  const lineNumberElements = useMemo(() => {
    if (!engine || !lineNumbers) return null;
    const { themeColors, lineCount, activeLine } = engine;
    const removed = diffRemovedColor(themeColors);
    const lines = [];
    for (let i = 1; i <= lineCount; i++) {
      const mark = gutterDiffMark(diffAnnotations, i);
      lines.push(
        <div
          key={i}
          data-diff={mark?.type}
          data-diff-deleted-above={mark?.deletedAbove ? "" : undefined}
          style={{
            position: "relative",
            color: i === activeLine ? themeColors.foreground : themeColors.gutterForeground,
            backgroundColor: i === activeLine ? themeColors.activeLineBackground : undefined,
          }}
          className="pr-3 text-right text-[13px] leading-[1.5] select-none"
        >
          {/* Change bar — VS Code convention: green added, blue modified. */}
          {mark?.type && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                borderRadius: 2,
                backgroundColor: diffMarkColor(mark.type, themeColors),
              }}
            />
          )}
          {/* Deletion wedge — lines were removed immediately above this one. */}
          {mark?.deletedAbove && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: -4,
                width: 0,
                height: 0,
                borderLeft: `8px solid ${removed}`,
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
              }}
            />
          )}
          {i}
          {/* Deletion at EOF — removed lines hang below the last line. */}
          {i === lineCount && hasDeletedAtEnd(diffAnnotations) && (
            <span
              aria-hidden="true"
              data-diff-deleted-at-end=""
              style={{
                position: "absolute",
                left: 0,
                bottom: -4,
                width: 0,
                height: 0,
                borderLeft: `8px solid ${removed}`,
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
              }}
            />
          )}
        </div>,
      );
    }
    return lines;
  }, [engine, lineNumbers, diffAnnotations]);

  // Every hook is above this line.
  if (!engine) return null;

  const {
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
  } = engine;

  const gutterWidth = lineNumbers ? `${Math.max(String(lineCount).length, 2) * 0.75 + 1.5}em` : "0";

  const containerStyle: React.CSSProperties = {
    backgroundColor: themeColors.background,
    color: themeColors.foreground,
    minHeight: _minHeight,
    maxHeight: _maxHeight,
  };

  const isEmpty = textareaRef.current ? textareaRef.current.value.length === 0 : highlightedHtml.length === 0;

  return (
    <div
      data-fancy-code-panel=""
      className={cn("relative overflow-auto", className)}
      style={containerStyle}
    >
      <div className="flex min-h-full">
        {/* Line numbers gutter */}
        {lineNumbers && (
          <div
            className="sticky left-0 z-10 shrink-0 pt-2.5 pb-2.5 pl-2"
            style={{
              backgroundColor: themeColors.gutterBackground,
              borderRight: `1px solid ${themeColors.gutterBorder}`,
              width: gutterWidth,
            }}
          >
            {lineNumberElements}
          </div>
        )}

        {/* Editor area */}
        <div className={cn("relative flex-1", wordWrap && "min-w-0")}>
          {/* Highlighted code overlay */}
          <pre
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden border-none p-2.5 text-[13px] leading-[1.5]"
            aria-hidden="true"
            style={{
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              overflowWrap: wordWrap ? "break-word" : "normal",
            }}
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedHtml + "\n" }} />
          </pre>

          {/* Placeholder */}
          {placeholder && isEmpty && (
            <div
              className="pointer-events-none absolute left-0 top-0 p-2.5 text-[13px] leading-[1.5] opacity-40"
              style={{ color: themeColors.foreground }}
            >
              {placeholder}
            </div>
          )}

          {/* Actual textarea for input */}
          <textarea
            ref={textareaRef}
            className={cn(
              "relative m-0 block resize-none border-none bg-transparent p-2.5 text-[13px] leading-[1.5] text-transparent outline-none",
              wordWrap ? "w-full" : "min-w-full",
            )}
            style={{
              caretColor: themeColors.cursorColor,
              minHeight: _minHeight ? _minHeight - 40 : 80,
              overflow: "hidden",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              overflowWrap: wordWrap ? "break-word" : "normal",
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            readOnly={readOnly}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onScroll={handleScroll}
            onSelect={handleSelect}
            onClick={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}

CodeEditorPanel.displayName = "CodeEditorPanel";
