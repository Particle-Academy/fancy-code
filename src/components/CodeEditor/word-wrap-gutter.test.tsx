// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeEditor } from "./CodeEditor";
import { useCodeEditor } from "./CodeEditor.context";
import type { CodeEditorContextValue } from "./CodeEditor.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no matchMedia, and the default theme ("auto") asks it about dark mode.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

/**
 * A soft-wrapped line keeps ONE gutter number (reported against 0.15.1).
 *
 * The gutter rendered one fixed-height row per logical line while the textarea
 * wrapped a long line over several visual rows, so every number below a long
 * line sat beside the wrong row: line 2's number was printed beside line 1's
 * second visual row, and the drift grew with every wrapped line.
 *
 * jsdom does no layout, so this file supplies a fake one: every element is
 * ROWS tall, where a logical line of text takes ceil(length / COLUMNS) rows (an
 * empty line still takes one). That is how a 40-column wrapping text box lays
 * out, and it is deliberately generic: it does not know which elements the
 * editor measures, only what text they hold.
 */
const COLUMNS = 40;
const ROW_PX = 19.5;

function fakeRows(text: string): number {
  return text
    .split("\n")
    .reduce((n, line) => n + Math.max(1, Math.ceil(line.length / COLUMNS)), 0);
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const height = fakeRows(this.textContent ?? "") * ROW_PX;
    return { x: 0, y: 0, top: 0, left: 0, right: 400, bottom: height, width: 400, height, toJSON: () => ({}) } as DOMRect;
  });
});

const cleanups: Array<() => void> = [];

function mount(el: ReactElement): HTMLElement {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(el));
  cleanups.push(() => {
    act(() => root.unmount());
    host.remove();
  });
  return host;
}

afterEach(() => {
  cleanups.splice(0).forEach((c) => c());
  vi.restoreAllMocks();
});

const LONG = "x".repeat(COLUMNS * 3 - 5); // wraps over exactly 3 rows
const VALUE = ["short", LONG, "third", "fourth"].join("\n");

/**
 * The gutter as a person sees it: one entry per VISUAL row, the number printed
 * on that row or "" when the row is blank. A gutter row's height is read from
 * its inline style in em (the gutter's grid is 1.5em per row); a row with no
 * height set is one row tall.
 *
 * The gutter is found structurally (the first column of the panel), not by a
 * handle, so the same reading applies to the code before this fix.
 */
function gutterRows(host: HTMLElement): string[] {
  const gutter = host.querySelector("[data-fancy-code-panel] > div > div:first-child");
  if (!gutter) throw new Error("no gutter rendered");
  const rows: string[] = [];
  for (const child of Array.from(gutter.children) as HTMLElement[]) {
    const h = child.style.height;
    const n = h.endsWith("em") ? Math.round(parseFloat(h) / 1.5) : 1;
    rows.push((child.textContent ?? "").trim());
    for (let i = 1; i < n; i++) rows.push("");
  }
  return rows;
}

const WRAPPED = ["1", "2", "", "", "3", "4"];
const UNWRAPPED = ["1", "2", "3", "4"];

describe("CodeEditor wordWrap gutter", () => {
  it("gives a wrapped line one number and blank continuation rows (wordWrap prop)", () => {
    const host = mount(
      <CodeEditor value={VALUE} wordWrap>
        <CodeEditor.Panel />
      </CodeEditor>,
    );

    // Line 2 wraps over three rows: one number, two blanks, and lines 3 and 4
    // land on the rows that actually hold lines 3 and 4.
    expect(gutterRows(host)).toEqual(WRAPPED);
  });

  it("numbers every row when wordWrap is off, since nothing wraps", () => {
    const host = mount(
      <CodeEditor value={VALUE}>
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    expect(gutterRows(host)).toEqual(UNWRAPPED);
  });

  it("follows toggleWordWrap() from useCodeEditor() at runtime, both ways", () => {
    let api: CodeEditorContextValue | null = null;
    function Grab() {
      const ctx = useCodeEditor();
      useEffect(() => {
        api = ctx;
      });
      return null;
    }

    const host = mount(
      <CodeEditor value={VALUE}>
        <Grab />
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    expect(gutterRows(host)).toEqual(UNWRAPPED);

    act(() => api!.toggleWordWrap());
    expect(api!.wordWrap).toBe(true);
    expect(gutterRows(host)).toEqual(WRAPPED);

    act(() => api!.toggleWordWrap());
    expect(api!.wordWrap).toBe(false);
    expect(gutterRows(host)).toEqual(UNWRAPPED);
  });

  it("re-measures when the value changes, so later numbers keep matching", () => {
    function Editor({ value }: { value: string }) {
      return (
        <CodeEditor value={value} wordWrap>
          <CodeEditor.Panel />
        </CodeEditor>
      );
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(<Editor value={VALUE} />));
    cleanups.push(() => {
      act(() => root.unmount());
      host.remove();
    });
    expect(gutterRows(host)).toEqual(WRAPPED);

    // Make line 4 wrap too (2 rows) and line 2 short.
    act(() => root.render(<Editor value={["short", "two", "third", "y".repeat(COLUMNS + 1)].join("\n")} />));
    expect(gutterRows(host)).toEqual(["1", "2", "3", "4", ""]);
  });

  it("keeps the real text: copying a wrapped line adds no newline", async () => {
    let api: CodeEditorContextValue | null = null;
    function Grab() {
      const ctx = useCodeEditor();
      useEffect(() => {
        api = ctx;
      });
      return null;
    }
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const host = mount(
      <CodeEditor value={VALUE} wordWrap>
        <Grab />
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    const ta = host.querySelector("textarea")!;

    // The wrap is soft: the textarea holds the logical text, never a hard break.
    expect(ta.value).toBe(VALUE);
    expect(ta.getAttribute("wrap")).not.toBe("hard");

    // Selecting just the wrapped line yields it with no newline inside it.
    const start = VALUE.indexOf(LONG);
    ta.setSelectionRange(start, start + LONG.length);
    expect(api!.getSelection()).toBe(LONG);

    await act(async () => {
      await api!.copyToClipboard();
    });
    expect(writeText).toHaveBeenCalledWith(VALUE);

    // Gutter numbers and any measuring copy of the text are not selectable, so
    // a page-level selection does not pick up numbers or a second copy.
    const gutter = host.querySelector("[data-fancy-code-panel] > div > div:first-child")!;
    for (const row of Array.from(gutter.children)) {
      expect(row.className).toContain("select-none");
    }
    const measure = host.querySelector("[data-fancy-code-wrap-measure]");
    if (measure) {
      expect(measure.getAttribute("aria-hidden")).toBe("true");
      expect(measure.className).toContain("select-none");
    }
  });
});
