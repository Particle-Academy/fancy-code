// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { FileViewer } from "./FileViewer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

/*
 * A file viewer shows a document as a reader sees it, not as its source.
 *
 * FileViewer knew two kinds of file: media, and everything else as text in a code
 * editor. So a README showed its markup, and a .docx / .xlsx / .pptx -- binary --
 * was handed to a code editor too. Documents now render through react-fancy's
 * ContentRenderer in the FauxClient frame every file viewer carries; Office files
 * are recognised for what they are.
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
  return host;
}

afterEach(() => {
  roots.splice(0).forEach((cleanup) => cleanup());
});

const viewer = (host: HTMLElement) => host.querySelector("[data-fancy-file-viewer]") as HTMLElement;

describe("FileViewer documents", () => {
  it("renders Markdown as a reader sees it, in the frame", () => {
    const host = mount(<FileViewer filename="README.md" value={"# Release notes\n\nShips **today**."} />);
    expect(viewer(host).getAttribute("data-kind")).toBe("document");
    expect(host.querySelector("h1")?.textContent).toBe("Release notes");
    expect(host.querySelector("strong")?.textContent).toBe("today");
    const frame = host.querySelector("[data-react-fancy-faux-client]");
    expect(frame).not.toBeNull();
    expect(frame!.querySelector("[data-react-fancy-faux-client-zoom-in]")).not.toBeNull();
    expect(frame!.querySelector("[data-react-fancy-faux-client-fullscreen]")).not.toBeNull();
  });

  it("renders HTML, sanitised, because a file is untrusted", () => {
    const host = mount(
      <FileViewer filename="page.html" value={'<h2>Hello</h2><script>window.__pwned = 1</script><p onclick="x()">Body</p>'} />,
    );
    expect(host.querySelector("h2")?.textContent).toBe("Hello");
    expect(host.querySelector("script")).toBeNull();
    expect(host.innerHTML).not.toContain("onclick");
  });

  it("renders plain text as paragraphs, escaped, not as markup", () => {
    const host = mount(<FileViewer filename="notes.txt" value={"a < b and *not bold*\nsame paragraph\n\nsecond"} />);
    const paragraphs = Array.from(host.querySelectorAll("[data-fancy-file-viewer] p")).map((p) => p.textContent);
    expect(paragraphs).toEqual(["a < b and *not bold*same paragraph", "second"]);
    expect(host.querySelector("em")).toBeNull();
  });

  it("shows the source with view=\"source\", and when editing", () => {
    const source = mount(<FileViewer filename="README.md" value="# Title" view="source" />);
    expect(viewer(source).getAttribute("data-kind")).toBe("text");
    const editing = mount(<FileViewer filename="README.md" value="# Title" readOnly={false} />);
    expect(viewer(editing).getAttribute("data-kind")).toBe("text");
  });

  it("shows the source when asked to land on a line, because a line is a place in the source", () => {
    const host = mount(<FileViewer filename="README.md" value={"# Title\n\nbody"} line={3} />);
    expect(viewer(host).getAttribute("data-kind")).toBe("text");
  });

  it("leaves code files in the code editor", () => {
    const host = mount(<FileViewer filename="app.tsx" value="export const x = 1;" />);
    expect(viewer(host).getAttribute("data-kind")).toBe("text");
  });
});

describe("FileViewer media", () => {
  it.each([
    ["chart.png", true],
    ["report.pdf", true],
  ])("frames %s", (filename) => {
    const host = mount(<FileViewer filename={filename} src={`/files/${filename}`} />);
    expect(host.querySelector("[data-react-fancy-faux-client]")).not.toBeNull();
    expect(host.querySelector("[data-react-fancy-faux-client-fullscreen]")).not.toBeNull();
  });

  it("lets the caller turn the frame off", () => {
    const host = mount(
      <FileViewer filename="chart.png" src="/files/chart.png" mediaProps={{ imageProps: { frame: false } }} />,
    );
    expect(host.querySelector("[data-react-fancy-faux-client]")).toBeNull();
  });
});

describe("FileViewer Office files", () => {
  it.each([
    ["report.docx", "docx"],
    ["budget.xlsx", "xlsx"],
    ["review.pptx", "pptx"],
  ])("never hands %s to a code editor", (filename, officeKind) => {
    const host = mount(<FileViewer filename={filename} src={`/files/${filename}`} />);
    expect(viewer(host).getAttribute("data-kind")).toBe("office");
    expect(viewer(host).getAttribute("data-office-kind")).toBe(officeKind);
    expect(host.querySelector("[data-fancy-code-editor], .cm-editor, textarea")).toBeNull();
    const download = host.querySelector(`a[href="/files/${filename}"]`);
    expect(download).not.toBeNull();
    expect(download!.hasAttribute("download")).toBe(true);
  });
});
