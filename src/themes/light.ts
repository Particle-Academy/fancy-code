import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { registerTheme } from "./registry";

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#1e1e2e",
    },
    ".cm-content": {
      caretColor: "#3b82f6",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#3b82f6",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#dbeafe",
    },
    ".cm-activeLine": {
      backgroundColor: "#f8fafc",
    },
    ".cm-gutters": {
      backgroundColor: "#f8fafc",
      color: "#94a3b8",
      borderRight: "1px solid #e2e8f0",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f1f5f9",
      color: "#475569",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#e2e8f0",
      color: "#64748b",
      border: "none",
    },
    ".cm-tooltip": {
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "#e2e8f0",
      borderBottomColor: "#e2e8f0",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "#ffffff",
      borderBottomColor: "#ffffff",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
      },
    },
    ".cm-searchMatch": {
      backgroundColor: "#fef08a",
      outline: "1px solid #facc15",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#bbf7d0",
      outline: "1px solid #22c55e",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#e0f2fe",
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      outline: "1px solid #94a3b8",
    },
    ".cm-matchingBracket": {
      backgroundColor: "#e0f2fe",
    },
  },
  { dark: false },
);

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#8b5cf6" },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: "#1e1e2e" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "#2563eb" },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: "#d97706" },
  { tag: [tags.definition(tags.name), tags.separator], color: "#1e1e2e" },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: "#d97706" },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)], color: "#0891b2" },
  { tag: [tags.meta, tags.comment], color: "#94a3b8", fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "#2563eb", textDecoration: "underline" },
  { tag: tags.heading, fontWeight: "bold", color: "#8b5cf6" },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: "#d97706" },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: "#059669" },
  { tag: tags.invalid, color: "#ef4444" },
  { tag: tags.tagName, color: "#dc2626" },
  { tag: tags.attributeName, color: "#d97706" },
  { tag: tags.attributeValue, color: "#059669" },
]);

registerTheme({
  name: "light",
  variant: "light",
  editorTheme,
  highlightStyle,
});
