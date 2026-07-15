// `ThemeColors` (the token/chrome palette) is defined in
// @particle-academy/fancy-file-commons and re-exported here. `ThemeDefinition`
// — the named, registrable wrapper — stays local to fancy-code's theme registry.
export type { ThemeColors } from "@particle-academy/fancy-file-commons";
import type { ThemeColors } from "@particle-academy/fancy-file-commons";

export interface ThemeDefinition {
  /** Unique theme name */
  name: string;
  /** Whether this is a dark or light theme */
  variant: "light" | "dark";
  /** Color definitions */
  colors: ThemeColors;
}
