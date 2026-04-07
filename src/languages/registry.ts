import type { LanguageDefinition } from "./types";

const languageRegistry = new Map<string, LanguageDefinition>();

export function registerLanguage(def: LanguageDefinition): void {
  languageRegistry.set(def.name.toLowerCase(), def);
  if (def.aliases) {
    for (const alias of def.aliases) {
      languageRegistry.set(alias.toLowerCase(), def);
    }
  }
}

export function getLanguage(name: string): LanguageDefinition | undefined {
  return languageRegistry.get(name.toLowerCase());
}

export function getRegisteredLanguages(): string[] {
  const seen = new Set<LanguageDefinition>();
  const names: string[] = [];
  for (const [, def] of languageRegistry) {
    if (!seen.has(def)) {
      seen.add(def);
      names.push(def.name);
    }
  }
  return names;
}
