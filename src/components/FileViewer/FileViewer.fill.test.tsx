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
 * A sized FileViewer fills its box with the code view.
 *
 * Media files already filled a FileViewer given a height; a text file did not.
 * The CodeEditor inside sized itself to its lines, so an eight-line file in a
 * 360px viewer showed eight lines of editor and then whatever was behind it.
 * jsdom does no layout, so these pin the flex chain that makes the editor fill:
 * wrapper is a column, the editor root grows and is a column, the panel grows.
 * The real layout is checked in a browser on the showcase.
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

const classes = (el: Element | null) => (el?.getAttribute("class") ?? "").split(/\s+/);

describe("FileViewer text fills a sized box", () => {
  it("makes the wrapper, the editor and the panel one growing flex column", () => {
    const host = mount(<FileViewer filename="player.tsx" value={"const a = 1;"} style={{ height: 360 }} />);
    const wrapper = host.querySelector("[data-fancy-file-viewer]");
    const editor = host.querySelector("[data-fancy-code-editor]");
    const panel = host.querySelector("[data-fancy-code-panel]");

    expect(wrapper?.getAttribute("data-kind")).toBe("text");
    expect(classes(wrapper)).toEqual(expect.arrayContaining(["flex", "flex-col"]));
    expect(classes(editor)).toEqual(expect.arrayContaining(["flex", "flex-col", "flex-1", "min-h-0"]));
    expect(classes(panel)).toEqual(expect.arrayContaining(["flex-1", "min-h-0"]));
    expect((wrapper as HTMLElement).style.height).toBe("360px");
  });

  it("keeps the caller's className on the wrapper", () => {
    const host = mount(<FileViewer filename="a.ts" value="x" className="h-72" />);
    expect(classes(host.querySelector("[data-fancy-file-viewer]"))).toEqual(
      expect.arrayContaining(["h-72", "flex", "flex-col"]),
    );
  });
});
