import { describe, it, expect } from "vitest";
import { resolveFileKind, languageFromFilename } from "./file-type";

describe("languageFromFilename", () => {
  it("maps known code extensions to a registered language", () => {
    expect(languageFromFilename("app.tsx")).toBe("typescript");
    expect(languageFromFilename("server.ts")).toBe("typescript");
    expect(languageFromFilename("index.js")).toBe("javascript");
    expect(languageFromFilename("data.json")).toBe("javascript");
    expect(languageFromFilename("page.html")).toBe("html");
    expect(languageFromFilename("api.php")).toBe("php");
    expect(languageFromFilename("main.py")).toBe("python");
    expect(languageFromFilename("server.go")).toBe("go");
    expect(languageFromFilename("README.md")).toBe("markdown");
  });

  it("is case-insensitive and ignores path + query", () => {
    expect(languageFromFilename("/src/App.TSX?v=2")).toBe("typescript");
    expect(languageFromFilename("C:\\proj\\Main.PY")).toBe("python");
  });

  it("falls back to plaintext for unknown / extension-less / dotfiles", () => {
    expect(languageFromFilename("notes.txt")).toBe("plaintext");
    expect(languageFromFilename("Makefile")).toBe("plaintext");
    expect(languageFromFilename(".gitignore")).toBe("plaintext");
    expect(languageFromFilename(undefined)).toBe("plaintext");
  });
});

describe("resolveFileKind", () => {
  it("classifies media files by extension", () => {
    expect(resolveFileKind({ filename: "logo.png" })).toEqual({
      kind: "media",
      mediaKind: "image",
    });
    expect(resolveFileKind({ filename: "clip.mp4" })).toEqual({
      kind: "media",
      mediaKind: "video",
    });
    expect(resolveFileKind({ filename: "track.mp3" })).toEqual({
      kind: "media",
      mediaKind: "audio",
    });
    expect(resolveFileKind({ filename: "report.pdf" })).toEqual({
      kind: "media",
      mediaKind: "pdf",
    });
    // SVG is media (an image), never text
    expect(resolveFileKind({ filename: "icon.svg" })).toEqual({
      kind: "media",
      mediaKind: "image",
    });
  });

  it("classifies text files and carries the language", () => {
    expect(resolveFileKind({ filename: "app.tsx" })).toEqual({
      kind: "text",
      language: "typescript",
    });
    expect(resolveFileKind({ filename: "notes.txt" })).toEqual({
      kind: "text",
      language: "plaintext",
    });
  });

  it("prefers MIME over the filename", () => {
    expect(resolveFileKind({ filename: "weird.txt", mime: "image/png" })).toEqual({
      kind: "media",
      mediaKind: "image",
    });
    // text MIME types resolve to text, not media
    expect(resolveFileKind({ filename: "data.json", mime: "application/json" })).toEqual({
      kind: "text",
      language: "javascript",
    });
  });
});
