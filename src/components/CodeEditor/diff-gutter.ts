/**
 * Diff-gutter model — the pure mapping between fancy-file-commons line
 * annotations and what the CodeEditor gutter renders per line-number row.
 * Kept DOM-free (like engine/position.ts) so it's unit-testable; the panel
 * only paints what this resolves.
 */
import type { DiffAnnotations, LineChangeType } from "@particle-academy/fancy-file-commons";
import type { ThemeColors } from "../../themes/types";

/** What one line-number row shows: its own change bar and/or a deletion wedge above. */
export interface GutterDiffMark {
  /** The line's own change (colored bar), if any. */
  type?: LineChangeType;
  /** True when one or more lines were deleted immediately above this line (wedge). */
  deletedAbove: boolean;
}

/** Resolve the mark for a 1-based line, or null when the line is untouched. */
export function gutterDiffMark(
  annotations: DiffAnnotations | null,
  line: number,
): GutterDiffMark | null {
  if (!annotations) return null;
  const a = annotations.byLine[line];
  if (!a) return null;
  return { type: a.type, deletedAbove: (a.deletedAbove ?? 0) > 0 };
}

/** Whether the deleted-at-EOF wedge should render under the last line. */
export function hasDeletedAtEnd(annotations: DiffAnnotations | null): boolean {
  return (annotations?.deletedAtEnd ?? 0) > 0;
}

/** VS Code-convention fallbacks for themes that don't define diff colors. */
const FALLBACK = { added: "#3fb950", modified: "#4184e4", removed: "#f85149" } as const;

/** The bar color for a change type, honoring theme overrides. */
export function diffMarkColor(type: LineChangeType, colors: ThemeColors): string {
  return type === "added"
    ? (colors.diffAdded ?? FALLBACK.added)
    : (colors.diffModified ?? FALLBACK.modified);
}

/** The deletion-wedge color, honoring theme overrides. */
export function diffRemovedColor(colors: ThemeColors): string {
  return colors.diffRemoved ?? FALLBACK.removed;
}
