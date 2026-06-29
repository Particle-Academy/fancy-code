import { describe, it, expect } from "vitest";
import { lineColumnToOffset } from "./position";

describe("lineColumnToOffset", () => {
  const text = "abc\ndef\nghij"; // line1=abc(0-2,\n@3) line2=def(4-6,\n@7) line3=ghij(8-11)

  it("returns the start-of-line offset for column 1", () => {
    expect(lineColumnToOffset(text, 1)).toBe(0);
    expect(lineColumnToOffset(text, 2)).toBe(4);
    expect(lineColumnToOffset(text, 3)).toBe(8);
  });

  it("applies a 1-based column within the line", () => {
    expect(lineColumnToOffset(text, 2, 1)).toBe(4); // 'd'
    expect(lineColumnToOffset(text, 2, 3)).toBe(6); // 'f'
  });

  it("clamps a line below 1 to the first line", () => {
    expect(lineColumnToOffset(text, 0)).toBe(0);
    expect(lineColumnToOffset(text, -5, 2)).toBe(1);
  });

  it("clamps a line past the end to the last line", () => {
    expect(lineColumnToOffset(text, 99)).toBe(8);
  });

  it("clamps a column past the line end to just after the last char", () => {
    expect(lineColumnToOffset(text, 1, 99)).toBe(3); // end of "abc"
    expect(lineColumnToOffset(text, 3, 99)).toBe(12); // end of "ghij" == text.length
  });

  it("handles an empty document", () => {
    expect(lineColumnToOffset("", 1, 1)).toBe(0);
    expect(lineColumnToOffset("", 5, 5)).toBe(0);
  });

  it("never returns an out-of-range offset", () => {
    for (const [l, c] of [[1, 1], [2, 2], [3, 4], [-1, -1], [50, 50]] as const) {
      const o = lineColumnToOffset(text, l, c);
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThanOrEqual(text.length);
    }
  });
});
