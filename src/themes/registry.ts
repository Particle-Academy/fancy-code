import type { ThemeDefinition } from "./types";

const themeRegistry = new Map<string, ThemeDefinition>();

export function registerTheme(theme: ThemeDefinition): void {
  themeRegistry.set(theme.name.toLowerCase(), theme);
}

export function getTheme(name: string): ThemeDefinition | undefined {
  return themeRegistry.get(name.toLowerCase());
}

export function getRegisteredThemes(): string[] {
  return Array.from(themeRegistry.keys());
}
