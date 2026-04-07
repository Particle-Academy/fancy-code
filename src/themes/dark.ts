import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { registerTheme } from "./registry";

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#18181b",
      color: "#e4e4e7",
    },
    ".cm-content": {
      caretColor: "#60a5fa",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#60a5fa",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#1e3a5f",
    },
    ".cm-activeLine": {
      backgroundColor: "#27272a",
    },
    ".cm-gutters": {
      backgroundColor: "#18181b",
      color: "#52525b",
      borderRight: "1px solid #27272a",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#27272a",
      color: "#a1a1aa",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "#3f3f46",
      color: "#a1a1aa",
      border: "none",
    },
    ".cm-tooltip": {
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      color: "#e4e4e7",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "#3f3f46",
      borderBottomColor: "#3f3f46",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "#27272a",
      borderBottomColor: "#27272a",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#1e3a5f",
        color: "#93c5fd",
      },
    },
    ".cm-searchMatch": {
      backgroundColor: "#854d0e",
      outline: "1px solid #a16207",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#166534",
      outline: "1px solid #15803d",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#1e3a5f",
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      outline: "1px solid #71717a",
    },
    ".cm-matchingBracket": {
      backgroundColor: "#3f3f46",
    },
  },
  { dark: true },
);

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c084fc" },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: "#e4e4e7" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "#60a5fa" },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: "#fbbf24" },
  { tag: [tags.definition(tags.name), tags.separator], color: "#e4e4e7" },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: "#fbbf24" },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)], color: "#22d3ee" },
  { tag: [tags.meta, tags.comment], color: "#71717a", fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "#60a5fa", textDecoration: "underline" },
  { tag: tags.heading, fontWeight: "bold", color: "#c084fc" },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: "#fbbf24" },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: "#34d399" },
  { tag: tags.invalid, color: "#f87171" },
  { tag: tags.tagName, color: "#f87171" },
  { tag: tags.attributeName, color: "#fbbf24" },
  { tag: tags.attributeValue, color: "#34d399" },
]);

registerTheme({
  name: "dark",
  variant: "dark",
  editorTheme,
  highlightStyle,
});
