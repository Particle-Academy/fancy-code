import { DARK_COLORS } from "@particle-academy/fancy-file-commons";
import { registerTheme } from "./registry";

// The palette lives in commons; fancy-code wraps it into a named, registrable
// theme for its IDE's theme picker + `theme="auto"` resolution.
registerTheme({
  name: "dark",
  variant: "dark",
  colors: DARK_COLORS,
});
