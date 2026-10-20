// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { FileViewer } from "./FileViewer";
import { clearOfficeViewers, registerOfficeViewer, type OfficeViewerProps } from "../../office-viewers";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/*
 * Office files open in the kit's own viewers, wired in by the app with one line
 * per format (owner, 2026-10-19), so fancy-code never imports fancy-slides or
 * fancy-sheets and cannot break the build of an app that has neither.
 *
 * Where the contents come from (owner, 2026-10-19: "both, server preferred"):
 * a `document` the app's server already read wins; with only `src`, the viewer
 * reads the file in the browser if the app registered a reader; otherwise the
 * download card, as before.
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
  clearOfficeViewers();
  vi.unstubAllGlobals();
});

function DeckView({ document, filename }: OfficeViewerProps) {
  return <div data-testid="deck">{`${filename}: ${(document as { title: string }).title}`}</div>;
}

const viewer = (host: HTMLElement) => host.querySelector("[data-fancy-file-viewer]") as HTMLElement;

describe("FileViewer Office viewers", () => {
  it("renders the registered viewer with the server-read document", () => {
    registerOfficeViewer("pptx", DeckView);
    const host = mount(<FileViewer filename="review.pptx" document={{ title: "Ops review" }} />);
    expect(host.querySelector("[data-testid=deck]")?.textContent).toBe("review.pptx: Ops review");
    expect(viewer(host).getAttribute("data-office-kind")).toBe("pptx");
  });

  it("prefers the server-read document over reading the file", () => {
    const read = vi.fn(() => ({ title: "from the browser" }));
    registerOfficeViewer("pptx", DeckView, { read });
    const host = mount(<FileViewer filename="review.pptx" src="/f/review.pptx" document={{ title: "from the server" }} />);
    expect(host.textContent).toContain("from the server");
    expect(read).not.toHaveBeenCalled();
  });

  it("reads the file in the browser when there is only a src and a reader", async () => {
    const bytes = new Uint8Array([80, 75, 3, 4]);
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, arrayBuffer: async () => bytes.buffer })));
    const read = vi.fn((b: Uint8Array) => ({ title: `read ${b.length} bytes` }));
    registerOfficeViewer("pptx", DeckView, { read });

    const host = mount(<FileViewer filename="review.pptx" src="/f/review.pptx" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledWith("/f/review.pptx");
    expect(read).toHaveBeenCalledTimes(1);
    expect(host.querySelector("[data-testid=deck]")?.textContent).toBe("review.pptx: read 4 bytes");
  });

  it("says so, with a download, when the file cannot be read", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(2) })));
    registerOfficeViewer("pptx", DeckView, { read: () => { throw new Error("not a pptx"); } });

    const host = mount(<FileViewer filename="review.pptx" src="/f/review.pptx" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(host.querySelector("[data-testid=deck]")).toBeNull();
    expect(host.textContent).toContain("not a pptx");
    expect(host.querySelector('a[href="/f/review.pptx"]')).not.toBeNull();
  });

  it("keeps the download card for a format nobody registered", () => {
    registerOfficeViewer("pptx", DeckView);
    const host = mount(<FileViewer filename="budget.xlsx" src="/f/budget.xlsx" />);
    expect(host.querySelector("[data-testid=deck]")).toBeNull();
    expect(host.querySelector('a[href="/f/budget.xlsx"]')).not.toBeNull();
  });
});
