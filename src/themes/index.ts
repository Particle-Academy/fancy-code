export type { ThemeDefinition } from "./types";
export { registerTheme, getTheme, getRegisteredThemes } from "./registry";

// Register built-in themes on import
import "./light";
import "./dark";
