import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown-render";

describe("renderMarkdown", () => {
  it("renders ATX headings at the right level", () => {
    expect(renderMarkdown("# Title")).toContain("<h1>Title</h1>");
    expect(renderMarkdown("### Sub")).toContain("<h3>Sub</h3>");
  });

  it("renders bold, italic, and inline code", () => {
    const html = renderMarkdown("a **b** _c_ `d`");
    expect(html).toContain("<strong>b</strong>");
    expect(html).toContain("<em>c</em>");
    expect(html).toContain("<code>d</code>");
  });

  it("renders links and images", () => {
    expect(renderMarkdown("[t](https://x.test)")).toContain('<a href="https://x.test" rel="noopener">t</a>');
    expect(renderMarkdown("![alt](/img.png)")).toContain('<img src="/img.png" alt="alt">');
  });

  it("renders a fenced code block with a language class and escaped body", () => {
    const html = renderMarkdown("```ts\nconst a = 1 < 2;\n```");
    expect(html).toContain('<pre><code class="language-ts">');
    expect(html).toContain("1 &lt; 2");
  });

  it("renders unordered and ordered lists", () => {
    expect(renderMarkdown("- a\n- b")).toContain("<ul>\n<li>a</li>\n<li>b</li>\n</ul>");
    expect(renderMarkdown("1. a\n2. b")).toContain("<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
  });

  it("renders blockquotes and horizontal rules", () => {
    expect(renderMarkdown("> quoted")).toContain("<blockquote>quoted</blockquote>");
    expect(renderMarkdown("---")).toContain("<hr>");
  });

  it("groups consecutive text into a paragraph", () => {
    expect(renderMarkdown("hello\nworld")).toContain("<p>hello world</p>");
  });

  it("escapes raw HTML in the source (safe by default)", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
