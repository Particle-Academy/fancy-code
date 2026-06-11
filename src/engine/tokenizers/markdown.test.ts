import { describe, it, expect } from "vitest";
import { tokenizeMarkdown } from "./markdown";

/** Substring covered by a token, for readable assertions. */
const span = (src: string, t: { start: number; end: number }) => src.slice(t.start, t.end);

describe("tokenizeMarkdown", () => {
  it("marks a heading line as a keyword", () => {
    const src = "# Title";
    const tokens = tokenizeMarkdown(src);
    const heading = tokens.find((t) => t.type === "keyword");
    expect(heading && span(src, heading)).toBe("# Title");
  });

  it("marks inline code as a string span", () => {
    const src = "use `x` here";
    const code = tokenizeMarkdown(src).find((t) => t.type === "string");
    expect(code && span(src, code)).toBe("`x`");
  });

  it("marks emphasis as a type span and a list marker as an operator", () => {
    const src = "- **bold** item";
    const tokens = tokenizeMarkdown(src);
    expect(tokens.find((t) => t.type === "operator") && span(src, tokens.find((t) => t.type === "operator")!)).toBe("-");
    expect(tokens.find((t) => t.type === "type") && span(src, tokens.find((t) => t.type === "type")!)).toBe("**bold**");
  });

  it("treats a fenced block body as string spans", () => {
    const src = "```\ncode line\n```";
    const strings = tokenizeMarkdown(src).filter((t) => t.type === "string");
    expect(strings.length).toBe(3); // opening fence, body, closing fence
  });

  it("produces ordered, non-overlapping inline spans", () => {
    const src = "`a` and **b** and `c`";
    const tokens = tokenizeMarkdown(src);
    for (let i = 1; i < tokens.length; i++) {
      expect(tokens[i].start).toBeGreaterThanOrEqual(tokens[i - 1].start);
    }
  });
});
