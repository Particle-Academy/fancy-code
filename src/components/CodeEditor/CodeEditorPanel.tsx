import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@particle-academy/react-fancy";
import { useCodeEditor } from "./CodeEditor.context";
import {
  diffMarkColor,
  diffRemovedColor,
  gutterDiffMark,
  hasDeletedAtEnd,
} from "./diff-gutter";
import type { CodeEditorPanelProps } from "./CodeEditor.types";

/** U+200B: gives the wrap probe one row of height and no width. */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

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
    _highlightLines: highlightLines,
    _aria: aria,
  } = useCodeEditor();

  // Soft-wrap rows per logical line. With `wordWrap` on, one logical line can
  // take several visual rows in the textarea, and the gutter has to give that
  // line ONE number followed by blank rows, or every number below it drifts
  // onto the wrong row. A textarea cannot report where its own text wraps, so a
  // hidden, zero-height copy of the text (`measureRef`), laid out exactly like
  // the textarea, is measured instead: one block per logical line, plus a probe
  // block that is one row tall by construction.
  //
  // `null` means "one row per line": wrap is off, or nothing was measurable.
  const measureRef = useRef<HTMLPreElement>(null);
  const [wrapRows, setWrapRows] = useState<number[] | null>(null);
  const hasEngine = engine != null;
  const value = engine?.value ?? "";
  const measureLines = useMemo(
    () => (wordWrap && hasEngine ? value.split("\n") : null),
    [wordWrap, hasEngine, value],
  );

  const measureWrap = useCallback(() => {
    const el = measureRef.current;
    let next: number[] | null = null;
    if (el && el.children.length > 1) {
      const rowPx = el.children[0].getBoundingClientRect().height;
      if (rowPx > 0) {
        next = [];
        for (let i = 1; i < el.children.length; i++) {
          const h = el.children[i].getBoundingClientRect().height;
          next.push(Math.max(1, Math.round(h / rowPx)));
        }
      }
    }
    setWrapRows((prev) => {
      if (prev === next) return prev;
      if (prev && next && prev.length === next.length && prev.every((r, i) => r === next![i])) {
        return prev;
      }
      return next;
    });
  }, []);

  // Before paint, so the gutter never shows the drifted numbering for a frame.
  useLayoutEffect(() => {
    measureWrap();
  }, [measureWrap, measureLines]);

  // Width changes (a resized pane, a late web font) re-wrap the text without
  // changing it; the measuring copy's box changes with them.
  const measuring = measureLines != null;
  useEffect(() => {
    const el = measureRef.current;
    if (!el || !measuring || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureWrap());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureWrap, measuring]);

  // Rows only count when they describe the text on screen right now.
  const lineCountNow = engine?.lineCount ?? -1;
  const rows = wordWrap && wrapRows && wrapRows.length === lineCountNow ? wrapRows : null;

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
    const highlighted = new Set(highlightLines ?? []);
    const lines = [];
    for (let i = 1; i <= lineCount; i++) {
      const mark = gutterDiffMark(diffAnnotations, i);
      // A soft-wrapped line is one gutter row as tall as all its visual rows:
      // the number sits on the first, the continuation rows stay blank.
      const span = rows?.[i - 1] ?? 1;
      lines.push(
        <div
          key={i}
          data-fancy-code-gutter-line={i}
          data-wrap-rows={span > 1 ? span : undefined}
          data-diff={mark?.type}
          data-diff-deleted-above={mark?.deletedAbove ? "" : undefined}
          style={{
            position: "relative",
            height: span > 1 ? `${span * 1.5}em` : undefined,
            color: i === activeLine || highlighted.has(i) ? themeColors.foreground : themeColors.gutterForeground,
            backgroundColor: i === activeLine ? themeColors.activeLineBackground : undefined,
            fontWeight: highlighted.has(i) ? 600 : undefined,
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
  }, [engine, lineNumbers, diffAnnotations, highlightLines, rows]);

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
    handleBlur,
    handleScroll,
    handleSelect,
    scrollTop,
    scrollLeft,
  } = engine;

  // Visual rows above logical line `n` (1-based).
  const rowsBefore = (n: number): number => {
    if (!rows) return n - 1;
    let total = 0;
    for (let i = 0; i < n - 1; i++) total += rows[i] ?? 1;
    return total;
  };

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
            data-fancy-code-gutter=""
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
          {/*
            Line bands — "here is the line you were sent to". Behind the code, and
            placed in em so they track the 13px / 1.5 line grid the gutter uses;
            0.625rem is the editor's top padding (p-2.5). With soft wrap a line
            starts below every visual row of the lines above it.
          */}
          {(highlightLines ?? [])
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= lineCount)
            .map((n) => (
              <div
                key={`highlight-${n}`}
                data-fancy-code-highlight-line={n}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 text-[13px] leading-[1.5]"
                style={{
                  top: `calc(0.625rem + ${rowsBefore(n) * 1.5}em)`,
                  height: `${(rows?.[n - 1] ?? 1) * 1.5}em`,
                  backgroundColor: themeColors.selectionBackground,
                  opacity: 0.55,
                }}
              />
            ))}

          {/*
            Wrap measure — a hidden copy of the text, laid out like the textarea
            (same padding, font, pre-wrap), so the panel can learn how many
            visual rows each logical line takes. Zero height and clipped, so it
            adds no scroll area; invisible, aria-hidden and unselectable, so no
            one sees, hears or copies a second copy of the text. Child 0 is a
            one-row probe; child i is logical line i.
          */}
          {measureLines && (
            <pre
              ref={measureRef}
              data-fancy-code-wrap-measure=""
              aria-hidden="true"
              className="pointer-events-none invisible absolute inset-x-0 top-0 m-0 select-none overflow-hidden border-none p-2.5 text-[13px] leading-[1.5]"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 0,
                margin: 0,
                padding: "0.625rem",
                overflow: "hidden",
                visibility: "hidden",
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              <span style={{ display: "block" }}>{ZERO_WIDTH_SPACE}</span>
              {measureLines.map((line, i) => (
                <span key={i} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </pre>
          )}

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
            // The name lands HERE, on the element a person types into.
            aria-label={aria?.["aria-label"]}
            aria-labelledby={aria?.["aria-labelledby"]}
            aria-describedby={aria?.["aria-describedby"]}
            // The focus ring sits on the textarea itself: it is the element that
            // holds focus, and a ring on a wrapper is invisible to a checker
            // (and to anyone who reads focus from the focused element).
            className={cn(
              "relative m-0 block resize-none border-none bg-transparent p-2.5 text-[13px] leading-[1.5] text-transparent",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--fancy-focus,var(--color-blue-500))] dark:focus-visible:ring-[color:var(--fancy-focus-dark,var(--color-blue-400))]",
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
            onBlur={handleBlur}
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
