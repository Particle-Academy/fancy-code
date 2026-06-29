/**
 * Convert a 1-based `line` / `column` into a 0-based character offset within
 * `text`. Out-of-range values clamp to the document and line bounds, so the
 * result is always a valid offset in `[0, text.length]`.
 *
 * - `line` below 1 clamps to line 1; above the last line clamps to the last line.
 * - `column` below 1 clamps to column 1; past the end of the line clamps to just
 *   after the last character (so you can place the caret at the line end).
 */
export function lineColumnToOffset(text: string, line: number, column = 1): number {
  const lines = text.split("\n");
  const targetLine = Math.max(1, Math.min(Math.trunc(line) || 1, lines.length));

  let offset = 0;
  for (let i = 0; i < targetLine - 1; i++) {
    offset += lines[i].length + 1; // +1 for the consumed "\n"
  }

  const lineText = lines[targetLine - 1] ?? "";
  const col = Math.max(1, Math.min(Math.trunc(column) || 1, lineText.length + 1));
  return offset + (col - 1);
}
