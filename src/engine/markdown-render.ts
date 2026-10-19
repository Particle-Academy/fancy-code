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

/**
 * Escape a value for use inside a double-quoted HTML attribute. Adds quote
 * escaping on top of `escapeHtml`'s `&<>` so the value can't break out of the
 * attribute. Apply to text that has already been `escapeHtml`-ed.
 */
function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Schemes a link may use. Anything else with a scheme renders as plain text. */
const LINK_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * The scheme a browser would see in this URL, or null for a relative URL.
 *
 * Normalised the way the URL parser does it: leading C0 controls and spaces are
 * stripped and tab / CR / LF are removed anywhere, so `" javascript:"` and a
 * scheme split by a tab are both caught. Case-insensitive.
 */
function schemeOf(url: string): string | null {
  let s = "";
  for (const ch of url) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13) continue;
    if (s === "" && code <= 32) continue;
    s += ch;
  }
  const m = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(s);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Is this URL safe in a preview inserted with innerHTML?
 *
 * The preview bypasses React, so React's `javascript:` guard never sees it. A
 * relative URL is always fine; an absolute one must use an allowed scheme, and
 * an image may additionally be a raster `data:image/...`. The input has already
 * been HTML-escaped, which neutralises entity-encoded schemes on its own.
 */
function safeUrl(url: string, kind: "link" | "image"): boolean {
  const scheme = schemeOf(url);
  if (scheme === null) return true;
  if (scheme === "http" || scheme === "https") return true;
  if (kind === "link") return LINK_SCHEMES.has(scheme);
  return scheme === "data" && /^data:image\/(png|jpe?g|gif|webp|avif|bmp);/i.test(url.trim());
}

/** Inline spans — run on already-escaped text. */
function inline(text: string): string {
  return text
    // images ![alt](src) -- an unsafe src keeps only its alt text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, src, title) =>
      safeUrl(src, "image")
        ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${title ? ` title="${escapeAttr(title)}"` : ""}>`
        : alt)
    // links [text](href) -- an unsafe href keeps only its text
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, t, href, title) =>
      safeUrl(href, "link")
        ? `<a href="${escapeAttr(href)}"${title ? ` title="${escapeAttr(title)}"` : ""} rel="noopener">${t}</a>`
        : t)
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
      out.push(`<pre><code${lang ? ` class="language-${escapeAttr(escapeHtml(lang))}"` : ""}>${escapeHtml(body.join("\n"))}</code></pre>`);
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
