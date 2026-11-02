import { describe, it, expect } from "vitest";
import {
  tokenizeJavaScript,
  tokenizeHtml,
  tokenizePhp,
  tokenizePython,
  tokenizeGo,
  tokenizeMarkdown,
  tokenizeShell,
  tokenizeDotenv,
  languageFromFilename,
} from "@particle-academy/fancy-file-commons";
import { getLanguage } from "./index";
import * as fancyCode from "../index";

// The grammars live in fancy-file-commons; fancy-code registers them. These
// assert the registry hands out exactly the shared tokenizers, so fancy-code's
// highlighting cannot drift from react-fancy's CodeBlock / CodeView.
describe("builtin languages", () => {
  it("registers the shared fancy-file-commons tokenizers", () => {
    expect(getLanguage("js")?.tokenize).toBe(tokenizeJavaScript);
    expect(getLanguage("ts")?.tokenize).toBe(tokenizeJavaScript);
    expect(getLanguage("html")?.tokenize).toBe(tokenizeHtml);
    expect(getLanguage("php")?.tokenize).toBe(tokenizePhp);
    expect(getLanguage("py")?.tokenize).toBe(tokenizePython);
    expect(getLanguage("golang")?.tokenize).toBe(tokenizeGo);
    expect(getLanguage("md")?.tokenize).toBe(tokenizeMarkdown);
  });

  it("registers shell and dotenv", () => {
    for (const alias of ["sh", "bash", "zsh", "shell"]) {
      expect(getLanguage(alias)?.tokenize, alias).toBe(tokenizeShell);
    }
    for (const alias of ["env", "dotenv"]) {
      expect(getLanguage(alias)?.tokenize, alias).toBe(tokenizeDotenv);
    }
  });

  it("every language languageFromFilename returns is registered", () => {
    for (const file of ["a.ts", "a.json", "a.html", "a.php", "a.py", "a.go", "a.md", "a.sh", ".env"]) {
      const lang = languageFromFilename(file);
      expect(getLanguage(lang), `${file} -> ${lang}`).toBeDefined();
    }
  });

  it("still exports tokenizeMarkdown", () => {
    expect(fancyCode.tokenizeMarkdown).toBe(tokenizeMarkdown);
  });
});
