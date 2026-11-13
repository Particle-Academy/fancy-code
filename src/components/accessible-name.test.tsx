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
 * Every editor's editing surface can be named, and is named by default.
 *
 * Lab run 601 (K28) recorded axe `label` (critical) on CodeEditor, FileViewer
 * and MarkdownEditor: the `<textarea>` a person actually types into had no
 * name, and none of the three accepted one. An `aria-label` on a wrapper would
 * not help: the name has to land on the textarea itself.
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

const textarea = (host: HTMLElement) => {
  const ta = host.querySelector("textarea");
  expect(ta).not.toBeNull();
  return ta!;
};

describe("CodeEditor", () => {
  it("has a default name on its textarea", () => {
    const host = mount(
      <CodeEditor value="let a = 1">
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    expect(textarea(host).getAttribute("aria-label")).toBe("Code editor");
  });

  it("puts aria-label, aria-labelledby and aria-describedby on the textarea", () => {
    const host = mount(
      <CodeEditor value="" aria-label="Build script" aria-describedby="hint">
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    expect(textarea(host).getAttribute("aria-label")).toBe("Build script");
    expect(textarea(host).getAttribute("aria-describedby")).toBe("hint");

    const host2 = mount(
      <CodeEditor value="" aria-labelledby="heading-1">
        <CodeEditor.Panel />
      </CodeEditor>,
    );
    // A labelledby wins, so no competing default label is added.
    expect(textarea(host2).getAttribute("aria-labelledby")).toBe("heading-1");
    expect(textarea(host2).hasAttribute("aria-label")).toBe(false);
  });
});

describe("FileViewer", () => {
  it("names its source view after the file by default", () => {
    const host = mount(<FileViewer filename="app.ts" value="export {}" />);
    expect(textarea(host).getAttribute("aria-label")).toBe("app.ts");
  });

  it("falls back to a generic name, and accepts a host's", () => {
    expect(textarea(mount(<FileViewer value="x" fileKind={{ kind: "text", language: "plaintext" } as never} />)).getAttribute("aria-label")).toBe("File contents");
    expect(textarea(mount(<FileViewer filename="a.ts" value="x" aria-label="Diff base" />)).getAttribute("aria-label")).toBe("Diff base");
    const t = textarea(mount(<FileViewer filename="a.ts" value="x" aria-labelledby="h2" />));
    expect(t.getAttribute("aria-labelledby")).toBe("h2");
    expect(t.hasAttribute("aria-label")).toBe(false);
  });
});

describe("MarkdownEditor", () => {
  it("has a default name and accepts a host's", () => {
    expect(textarea(mount(<MarkdownEditor value="# Hi" mode="edit" />)).getAttribute("aria-label")).toBe("Markdown editor");
    expect(textarea(mount(<MarkdownEditor value="# Hi" mode="edit" aria-label="Post body" />)).getAttribute("aria-label")).toBe("Post body");
    const t = textarea(mount(<MarkdownEditor value="# Hi" mode="edit" aria-labelledby="lbl" />));
    expect(t.getAttribute("aria-labelledby")).toBe("lbl");
    expect(t.hasAttribute("aria-label")).toBe(false);
  });
});
