// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { MarkdownEditor } from "./MarkdownEditor";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * The preview pane renders a real document.
 *
 * Reported by a consumer (Ripple) reviewing brand kits through this surface:
 * the built-in `renderMarkdown` has no table support at all, and treats a
 * hard-wrapped blockquote or list item as one block per SOURCE line. Measured
 * before changing anything — a GFM table collapsed to a single run-on `<p>`, a
 * two-line quote became two `<blockquote>`s, and a wrapped bullet's
 * continuation escaped the `<ul>` entirely to become a `<p>`.
 *
 * Their document is hard-wrapped at ~95 chars, so the soft-break defect
 * degraded EVERYTHING rather than one block type, and read as though the author
 * had written it badly. The table was the proof-points block — the thing a
 * reviewer actually checks. A review surface that cannot display the document
 * conceals the very thing it exists to surface.
 *
 * The fix is not a new renderer. `marked` was already in the tree as a runtime
 * dependency of react-fancy, exposed as `<ContentRenderer format="markdown">`,
 * and fancy-code already depends on react-fancy — so the kit already shipped a
 * full CommonMark+GFM renderer and this package was hand-rolling a second,
 * weaker one. `renderMarkdown` stays exported for anyone calling it directly.
 */

function mount(el: ReactElement) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(el));
  return { host, unmount: () => act(() => root.unmount()) };
}

/** Hard-wrapped the way a real document is. */
const DOC = [
  "| Claim | Evidence | Status |",
  "|---|---|---|",
  "| PA is an outreach arm | Operating manual | Usable |",
  "",
  "> A blockquote that is hard wrapped across",
  "> two source lines here.",
  "",
  "- A bullet that wraps mid sentence into a",
  "  continuation line.",
].join("\n");

describe("MarkdownEditor preview", () => {
  it("renders a GFM table as a real table", () => {
    const { host, unmount } = mount(<MarkdownEditor value={DOC} mode="preview" />);

    expect(host.querySelectorAll("table").length).toBe(1);
    expect(host.querySelectorAll("th").length).toBe(3);
    expect(host.querySelector("td")?.textContent).toContain("PA is an outreach arm");

    unmount();
  });

  it("keeps a hard-wrapped blockquote as ONE blockquote", () => {
    const { host, unmount } = mount(<MarkdownEditor value={DOC} mode="preview" />);

    expect(host.querySelectorAll("blockquote").length).toBe(1);

    unmount();
  });

  it("keeps a wrapped list item's continuation inside the item", () => {
    const { host, unmount } = mount(<MarkdownEditor value={DOC} mode="preview" />);

    const item = host.querySelector("li");
    expect(item?.textContent?.replace(/\s+/g, " ")).toContain(
      "A bullet that wraps mid sentence into a continuation line.",
    );

    unmount();
  });

  it("still honours a host-supplied renderPreview", () => {
    // The escape hatch has to keep working — a consumer who swapped in their own
    // renderer must not silently get ours back.
    const { host, unmount } = mount(
      <MarkdownEditor value={DOC} mode="preview" renderPreview={() => "<p id='mine'>custom</p>"} />,
    );

    expect(host.querySelector("#mine")).not.toBeNull();
    expect(host.querySelectorAll("table").length).toBe(0);

    unmount();
  });

  it("constrains the preview with maxHeight", () => {
    // `maxHeight` was passed to the editor pane only, so a ~3000px document
    // rendered at full height instead of scrolling.
    const { host, unmount } = mount(
      <MarkdownEditor value={DOC} mode="preview" maxHeight={240} />,
    );

    const preview = host.querySelector<HTMLElement>("[data-fancy-markdown-preview]");
    expect(preview?.style.maxHeight).toBe("240px");
    expect(preview?.style.overflowY).toBe("auto");

    unmount();
  });
});
