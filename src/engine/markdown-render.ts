/**
 * Tiny, dependency-free Markdown → HTML renderer for the MarkdownEditor preview
 * pane. Covers the common subset — headings, bold/italic, inline + fenced code,
 * links, images, blockquotes, ordered/unordered lists, hr, and paragraphs. Input
 * is HTML-escaped first, so raw HTML in the source is shown as text (safe by
 * default). Not a full CommonMark implementation; swap in a real renderer
 * downstream if you need one.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline spans — run on already-escaped text. */
function inline(text: string): string {
  return text
    // images ![alt](src)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, src, title) => `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ""}>`)
    // links [text](href)
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, t, href, title) => `<a href="${href}"${title ? ` title="${title}"` : ""} rel="noopener">${t}</a>`)
    // inline code `code`
    .replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`)
    // bold **x** / __x__
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "<strong>$2</strong>")
    // italic *x* / _x_
    .replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, "<em>$2</em>");
}

export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];

  let i = 0;
  let para: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*(```|~~~)(.*)$/);
    if (fence) {
      flushPara();
      closeList();
      const lang = fence[2].trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*(```|~~~)/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // consume closing fence
      out.push(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ""}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const esc = escapeHtml(line);

    // Blank line — paragraph/list break
    if (/^\s*$/.test(line)) {
      flushPara();
      closeList();
      i++;
      continue;
    }

    // Heading
    const heading = esc.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr>");
      i++;
      continue;
    }

    // Blockquote (single-level)
    const quote = esc.match(/^\s*&gt;\s?(.*)$/);
    if (quote) {
      flushPara();
      closeList();
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      i++;
      continue;
    }

    // List item
    const ol = esc.match(/^\s*\d+\.\s+(.*)$/);
    const ul = esc.match(/^\s*[-*+]\s+(.*)$/);
    if (ol || ul) {
      flushPara();
      const type: "ul" | "ol" = ol ? "ol" : "ul";
      if (listType !== type) {
        closeList();
        out.push(`<${type}>`);
        listType = type;
      }
      out.push(`<li>${inline((ol ?? ul)![1])}</li>`);
      i++;
      continue;
    }

    // Plain paragraph text (accumulate)
    closeList();
    para.push(esc);
    i++;
  }

  flushPara();
  closeList();
  return out.join("\n");
}
