// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { CodeEditor } from "./CodeEditor";
import { FileViewer } from "./FileViewer";
import { MarkdownEditor } from "./MarkdownEditor";

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
 * Keyboard accessibility of the editing textarea shared by CodeEditor,
 * FileViewer and MarkdownEditor.
 *
 * Measured by an accessibility checker in Chromium with real Tab presses:
 * - the focused textarea showed no focus indicator (`outline-none`, nothing else);
 * - FileViewer (read-only) prevented EVERY key, Tab included, so focus could
 *   never leave it;
 * - editable editors always turned Tab into indentation, so a keyboard user who
 *   tabbed in could never tab out (WCAG 2.1.2).
 *
 * jsdom cannot compute :focus-visible, so the ring is asserted by its classes on
 * the focused element itself. Traps are asserted through `defaultPrevented` on a
 * dispatched Tab: an unprevented Tab is the browser moving focus on.
 */
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
});

function textarea(host: HTMLElement): HTMLTextAreaElement {
  const ta = host.querySelector("textarea");
  expect(ta).not.toBeNull();
  return ta!;
}

/** Dispatch a keydown the way a real key press reaches React; returns the event. */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const ev = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  act(() => {
    el.dispatchEvent(ev);
  });
  return ev;
}

/** Simulate the user typing one character (what makes an edit). */
function type(ta: HTMLTextAreaElement, text: string) {
  act(() => {
    ta.value = ta.value + text;
    ta.selectionStart = ta.selectionEnd = ta.value.length;
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function focus(ta: HTMLTextAreaElement) {
  act(() => ta.focus());
  expect(document.activeElement).toBe(ta);
}

const RING = [
  "focus-visible:ring-2",
  "focus-visible:ring-inset",
  "focus-visible:ring-[color:var(--fancy-focus,var(--color-blue-500))]",
  "dark:focus-visible:ring-[color:var(--fancy-focus-dark,var(--color-blue-400))]",
];

describe("editing textarea — visible focus", () => {
  const cases: Array<[string, ReactElement]> = [
    ["CodeEditor", <CodeEditor value="let a = 1"><CodeEditor.Panel /></CodeEditor>],
    ["FileViewer", <FileViewer filename="a.ts" value="let a = 1" />],
    ["MarkdownEditor", <MarkdownEditor value="# Hi" />],
  ];

  for (const [name, el] of cases) {
    it(`${name}: the focused textarea itself carries the kit focus ring`, () => {
      const ta = textarea(mount(el));
      focus(ta);
      const classes = (document.activeElement as HTMLElement).className.split(/\s+/);
      for (const c of RING) expect(classes).toContain(c);
    });
  }
});

describe("FileViewer (read-only) — no keyboard trap", () => {
  it("does not prevent Tab or Shift+Tab, so focus can leave", () => {
    const ta = textarea(mount(<FileViewer filename="a.ts" value={"a\nb\nc"} />));
    focus(ta);
    expect(press(ta, "Tab").defaultPrevented).toBe(false);
    expect(press(ta, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
  });

  it("lets caret and navigation keys through", () => {
    const ta = textarea(mount(<FileViewer filename="a.ts" value={"a\nb\nc"} />));
    focus(ta);
    for (const key of ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp"]) {
      expect(press(ta, key).defaultPrevented, key).toBe(false);
    }
  });

  it("still refuses Tab-indent: the value does not change", () => {
    const ta = textarea(mount(<FileViewer filename="a.ts" value="abc" />));
    focus(ta);
    press(ta, "Tab");
    expect(ta.value).toBe("abc");
  });
});

describe("editable editors — Tab is armed only after an edit", () => {
  const cases: Array<[string, () => ReactElement]> = [
    ["CodeEditor", () => <CodeEditor defaultValue="abc"><CodeEditor.Panel /></CodeEditor>],
    ["MarkdownEditor", () => <MarkdownEditor defaultValue="abc" />],
  ];

  for (const [name, make] of cases) {
    it(`${name}: Tab right after focusing moves focus on (not prevented, no indent)`, () => {
      const ta = textarea(mount(make()));
      focus(ta);
      expect(press(ta, "Tab").defaultPrevented).toBe(false);
      expect(press(ta, "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
      expect(ta.value).toBe("abc");
    });

    it(`${name}: after typing, Tab indents`, () => {
      const ta = textarea(mount(make()));
      focus(ta);
      type(ta, "d");
      const ev = press(ta, "Tab");
      expect(ev.defaultPrevented).toBe(true);
      expect(ta.value).toBe("abcd  ");
    });

    it(`${name}: after typing, Shift+Tab dedents`, () => {
      const ta = textarea(mount(make()));
      focus(ta);
      act(() => {
        ta.value = "    x";
        ta.selectionStart = ta.selectionEnd = ta.value.length;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      });
      const ev = press(ta, "Tab", { shiftKey: true });
      expect(ev.defaultPrevented).toBe(true);
      expect(ta.value).toBe("  x");
    });

    it(`${name}: Escape disarms, so the next Tab leaves`, () => {
      const ta = textarea(mount(make()));
      focus(ta);
      type(ta, "d");
      press(ta, "Escape");
      expect(press(ta, "Tab").defaultPrevented).toBe(false);
      expect(ta.value).toBe("abcd");
    });

    it(`${name}: blur disarms, so Tab after refocusing leaves`, () => {
      const ta = textarea(mount(make()));
      focus(ta);
      type(ta, "d");
      act(() => ta.blur());
      focus(ta);
      expect(press(ta, "Tab").defaultPrevented).toBe(false);
      expect(ta.value).toBe("abcd");
    });
  }
});
