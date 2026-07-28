// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeEditorContext } from "./CodeEditor.context";
import { CodeEditorPanel } from "./CodeEditorPanel";
import type { CodeEditorContextValue } from "./CodeEditor.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * CodeEditorPanel survives `_engineReturn` going null -> ready.
 *
 * `if (!engine) return null` used to sit ABOVE the `useMemo` that builds the
 * gutter, so a render without an engine ran zero hooks and the next one ran one.
 * React compares hook counts between renders, so that transition throws
 * "Rendered more hooks than during the previous render" from inside React,
 * naming none of this file.
 *
 * `_engineReturn` is typed `UseEditorEngineReturn | null`, so a host rendering
 * the panel before the engine settles hits exactly this. The rest of the suite
 * never saw it because no test rendered the panel twice with the value changing.
 */
const roots: Array<() => void> = [];

function mount(el: ReactElement) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(el));
  roots.push(() => {
    act(() => root.unmount());
    host.remove();
  });
  return { host, rerender: (next: ReactElement) => act(() => root.render(next)) };
}

afterEach(() => {
  roots.splice(0).forEach((cleanup) => cleanup());
  vi.restoreAllMocks();
});

/** The smallest context the panel will accept. Fields are read, never invoked. */
function ctx(engine: CodeEditorContextValue["_engineReturn"]): CodeEditorContextValue {
  return {
    _engineReturn: engine,
    lineNumbers: true,
    wordWrap: false,
    readOnly: false,
    placeholder: "",
    _diffAnnotations: null,
    _maxHeight: undefined,
    _minHeight: undefined,
  } as unknown as CodeEditorContextValue;
}

function fakeEngine() {
  return {
    textareaRef: { current: null },
    highlightedHtml: "",
    lineCount: 3,
    activeLine: 1,
    themeColors: {
      background: "#fff",
      foreground: "#000",
      gutterForeground: "#888",
      activeLineBackground: "#eee",
    },
    handleKeyDown: () => {},
    handleInput: () => {},
    handleScroll: () => {},
    handleSelect: () => {},
    scrollTop: 0,
    scrollLeft: 0,
  } as unknown as NonNullable<CodeEditorContextValue["_engineReturn"]>;
}

describe("CodeEditorPanel hook order", () => {
  it("does not throw when the engine arrives after the first render", () => {
    const errors: unknown[] = [];
    vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args[0]);
    });

    const { host, rerender } = mount(
      <CodeEditorContext.Provider value={ctx(null)}>
        <CodeEditorPanel />
      </CodeEditorContext.Provider>,
    );

    // No engine yet: the panel renders nothing, which is correct.
    expect(host.innerHTML).toBe("");

    expect(() => {
      rerender(
        <CodeEditorContext.Provider value={ctx(fakeEngine())}>
          <CodeEditorPanel />
        </CodeEditorContext.Provider>,
      );
    }).not.toThrow();

    // It must actually have rendered — "no throw" is satisfied by a panel that
    // silently stayed empty, which would prove nothing.
    expect(host.innerHTML).not.toBe("");

    const hookErrors = errors.filter(
      (e) => typeof e === "string" && /Rendered more hooks|order of Hooks|hook/i.test(e),
    );
    expect(hookErrors, `React reported: ${String(hookErrors[0])}`).toEqual([]);
  });

  it("still renders when the engine is present from the very first render", () => {
    // The counter-case: the branch every existing test already exercised, which
    // must keep working now that the hook moved above the guard.
    const { host } = mount(
      <CodeEditorContext.Provider value={ctx(fakeEngine())}>
        <CodeEditorPanel />
      </CodeEditorContext.Provider>,
    );

    expect(host.innerHTML).not.toBe("");
  });
});
