export interface ThemeColors {
  // Editor chrome
  background: string;
  foreground: string;
  gutterBackground: string;
  gutterForeground: string;
  gutterBorder: string;
  activeLineBackground: string;
  selectionBackground: string;
  cursorColor: string;
  // Token colors
  keyword: string;
  string: string;
  comment: string;
  number: string;
  operator: string;
  function: string;
  type: string;
  tag: string;
  attribute: string;
  attributeValue: string;
  punctuation: string;
  variable: string;
}

export interface ThemeDefinition {
  /** Unique theme name */
  name: string;
  /** Whether this is a dark or light theme */
  variant: "light" | "dark";
  /** Color definitions */
  colors: ThemeColors;
}
