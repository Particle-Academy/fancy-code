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
  });

  it("classifies documents, which a viewer renders rather than shows as source", () => {
    expect(resolveFileKind({ filename: "notes.txt" })).toEqual({ kind: "document", format: "text", language: "plaintext" });
    expect(resolveFileKind({ filename: "README.md" })).toEqual({ kind: "document", format: "markdown", language: "markdown" });
    expect(resolveFileKind({ filename: "page.html" })).toEqual({ kind: "document", format: "html", language: "html" });
    expect(resolveFileKind({ mime: "text/markdown" })).toMatchObject({ kind: "document", format: "markdown" });
  });

  it("keeps a code file as code when a host labels it text/plain", () => {
    // Hosts often serve source as text/plain; the extension knows better.
    expect(resolveFileKind({ filename: "app.ts", mime: "text/plain" })).toEqual({ kind: "text", language: "typescript" });
    expect(resolveFileKind({ filename: "README.md", mime: "text/plain" })).toMatchObject({ kind: "document", format: "markdown" });
  });

  it("classifies Office files instead of calling them text", () => {
    expect(resolveFileKind({ filename: "a.docx" })).toEqual({ kind: "office", officeKind: "docx" });
    expect(resolveFileKind({ filename: "a.xlsx" })).toEqual({ kind: "office", officeKind: "xlsx" });
    expect(resolveFileKind({ filename: "a.pptx" })).toEqual({ kind: "office", officeKind: "pptx" });
    expect(
      resolveFileKind({ mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
    ).toEqual({ kind: "office", officeKind: "docx" });
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
