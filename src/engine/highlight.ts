import type { Token, TokenType } from "./tokenizer";
import type { ThemeColors } from "../themes/types";

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert source code + tokens + theme colors into highlighted HTML.
 * Returns an HTML string with <span> elements for each token.
 */
export function highlightCode(source: string, tokens: Token[], colors: ThemeColors): string {
  if (tokens.length === 0) return escapeHtml(source);

  const colorMap: Record<TokenType, string> = {
    keyword: colors.keyword,
    string: colors.string,
    comment: colors.comment,
    number: colors.number,
    operator: colors.operator,
    function: colors.function,
    type: colors.type,
    tag: colors.tag,
    attribute: colors.attribute,
    attributeValue: colors.attributeValue,
    punctuation: colors.punctuation,
    variable: colors.variable,
    plain: colors.foreground,
  };

  const parts: string[] = [];
  let pos = 0;

  for (const token of tokens) {
    // Plain text before this token
    if (token.start > pos) {
      parts.push(escapeHtml(source.slice(pos, token.start)));
    }

    const text = escapeHtml(source.slice(token.start, token.end));
    const color = colorMap[token.type];
    const style = token.type === "comment"
      ? `color:${color};font-style:italic`
      : `color:${color}`;

    parts.push(`<span style="${style}">${text}</span>`);
    pos = token.end;
  }

  // Remaining text after last token
  if (pos < source.length) {
    parts.push(escapeHtml(source.slice(pos)));
  }

  return parts.join("");
}
