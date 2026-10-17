// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { FileViewer } from "./FileViewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no matchMedia, and the default theme ("auto") asks it about dark mode.
// Stubbed rather than switching theme, so these tests run the default path.
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
});

const SOURCE = Array.from({ length: 40 }, (_, i) => `const line${i + 1} = ${i + 1};`).join(String.fromCharCode(10));

/** Offset of the start of a 1-based line in SOURCE. */
function lineStart(line: number): number {
  return SOURCE.split(String.fromCharCode(10))
    .slice(0, line - 1)
    .reduce((n, l) => n + l.length + 1, 0);
}

const bands = (host: HTMLElement) =>
  Array.from(host.querySelectorAll<HTMLElement>("[data-fancy-code-highlight-line]")).map((b) =>
    Number(b.getAttribute("data-fancy-code-highlight-line")),
  );

/**
 * Genie 2's `openFileForUser(path, line)` now opens a file in Genie's own panel,
 * which is a FileViewer — and FileViewer had no way to land on a line. CodeEditor
 * could already reveal one (`cursorLine`); FileViewer never passed it through, and
 * nothing marked the line once you got there.
 */
describe("FileViewer — line", () => {
  it("puts the caret on the line", () => {
    const { host } = mount(<FileViewer filename="a.ts" value={SOURCE} line={25} />);

    const ta = host.querySelector("textarea")!;
    expect(ta.selectionStart).toBe(lineStart(25));
  });

  it("highlights that line", () => {
    const { host } = mount(<FileViewer filename="a.ts" value={SOURCE} line={25} />);

    expect(bands(host)).toEqual([25]);
  });

  it("moves again when `line` changes", () => {
    const { host, rerender } = mount(<FileViewer filename="a.ts" value={SOURCE} line={5} />);

    rerender(<FileViewer filename="a.ts" value={SOURCE} line={30} />);

    expect(host.querySelector("textarea")!.selectionStart).toBe(lineStart(30));
    expect(bands(host)).toEqual([30]);
  });

  it("highlightLines overrides what is highlighted, and [] turns it off", () => {
    const many = mount(<FileViewer filename="a.ts" value={SOURCE} line={10} highlightLines={[10, 11, 12]} />);
    expect(bands(many.host)).toEqual([10, 11, 12]);

    const none = mount(<FileViewer filename="a.ts" value={SOURCE} line={10} highlightLines={[]} />);
    expect(bands(none.host)).toEqual([]);
  });

  it("places each band on its own line", () => {
    const { host } = mount(<FileViewer filename="a.ts" value={SOURCE} highlightLines={[1, 3]} />);

    const [first, third] = Array.from(host.querySelectorAll<HTMLElement>("[data-fancy-code-highlight-line]"));
    // The DOM may reorder the terms of calc(), so read the parts: the editor's
    // top padding plus 1.5em per line above.
    const emTerm = (top: string) =>
      top
        .replace("calc(", "")
        .replace(")", "")
        .split(" + ")
        .find((t) => t.endsWith("em") && !t.endsWith("rem"));
    expect(first.style.top).toContain("0.625rem");
    expect(emTerm(first.style.top)).toBe("0em");
    expect(third.style.top).toContain("0.625rem");
    expect(emTerm(third.style.top)).toBe("3em");
  });

  it("ignores lines outside the document", () => {
    const { host } = mount(<FileViewer filename="a.ts" value={SOURCE} highlightLines={[0, 41, 2]} />);

    expect(bands(host)).toEqual([2]);
  });

  it("with no line, nothing is highlighted", () => {
    const { host } = mount(<FileViewer filename="a.ts" value={SOURCE} />);

    expect(bands(host)).toEqual([]);
  });

  it("media ignores it", () => {
    const { host } = mount(<FileViewer filename="logo.png" src="data:image/png;base64,AA==" line={3} />);

    expect(bands(host)).toEqual([]);
  });
});
