import { describe, it, expect } from "vitest";
import { annotateLines } from "@particle-academy/fancy-file-commons";
import {
  gutterDiffMark,
  hasDeletedAtEnd,
  diffMarkColor,
  diffRemovedColor,
} from "./diff-gutter";
import type { ThemeColors } from "../../themes/types";

const BASE = "one\ntwo\nthree\nfour";

describe("gutterDiffMark", () => {
  it("returns null without annotations or for untouched lines", () => {
    expect(gutterDiffMark(null, 1)).toBeNull();
    const ann = annotateLines(BASE, BASE);
    expect(gutterDiffMark(ann, 1)).toBeNull();
    expect(gutterDiffMark(ann, 4)).toBeNull();
  });

  it("marks added and modified lines", () => {
    // two -> 2 (modified), NEW appended after three (added), four deleted.
    const ann = annotateLines(BASE, "one\n2\nthree\nNEW");
    expect(gutterDiffMark(ann, 2)).toEqual({ type: "modified", deletedAbove: false });
    // line 4: "four" replaced by "NEW" is part of the same replace region…
    expect(gutterDiffMark(ann, 4)?.type).toBeDefined();
  });

  it("flags deletions above a line", () => {
    const ann = annotateLines("one\nGONE\ntwo", "one\ntwo");
    expect(gutterDiffMark(ann, 2)).toEqual({ type: undefined, deletedAbove: true });
    expect(hasDeletedAtEnd(ann)).toBe(false);
  });

  it("flags a deletion at EOF", () => {
    const ann = annotateLines("one\ntwo\nGONE", "one\ntwo");
    expect(hasDeletedAtEnd(ann)).toBe(true);
    expect(gutterDiffMark(ann, 2)).toBeNull();
  });
});

describe("diff colors", () => {
  const themed = { diffAdded: "#111111", diffModified: "#222222", diffRemoved: "#333333" } as ThemeColors;
  const bare = {} as ThemeColors;

  it("honors theme overrides", () => {
    expect(diffMarkColor("added", themed)).toBe("#111111");
    expect(diffMarkColor("modified", themed)).toBe("#222222");
    expect(diffRemovedColor(themed)).toBe("#333333");
  });

  it("falls back to the VS Code-convention palette", () => {
    expect(diffMarkColor("added", bare)).toBe("#3fb950");
    expect(diffMarkColor("modified", bare)).toBe("#4184e4");
    expect(diffRemovedColor(bare)).toBe("#f85149");
  });
});
