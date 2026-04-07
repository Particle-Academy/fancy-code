import { useEffect, useRef, type RefObject } from "react";
import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers as lineNumbersExt, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, placeholder as placeholderExt } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { getLanguage } from "../languages";
import { getTheme } from "../themes";

export interface UseCodemirrorOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  value: string;
  onChange?: (value: string) => void;
  language: string;
  theme: string;
  readOnly: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  tabSize: number;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  searchEnabled: boolean;
  additionalExtensions?: Extension[];
  onCursorChange?: (pos: { line: number; col: number; selectionLength: number }) => void;
}

export interface UseCodemirrorReturn {
  view: EditorView | null;
}

function resolveLanguageExtension(name: string): Extension {
  const def = getLanguage(name);
  if (!def) return [];
  const result = def.support();
  if (result instanceof Promise) {
    // Async languages are not supported in the initial render; return empty
    return [];
  }
  return result;
}

function resolveThemeExtensions(name: string): Extension[] {
  const def = getTheme(name);
  if (!def) {
    const fallback = getTheme("dark");
    if (!fallback) return [];
    return [fallback.editorTheme, syntaxHighlighting(fallback.highlightStyle)];
  }
  return [def.editorTheme, syntaxHighlighting(def.highlightStyle)];
}

export function useCodemirror({
  containerRef,
  value,
  onChange,
  language,
  theme,
  readOnly,
  lineNumbers,
  wordWrap,
  tabSize,
  placeholder,
  minHeight,
  maxHeight,
  searchEnabled,
  additionalExtensions,
  onCursorChange,
}: UseCodemirrorOptions): UseCodemirrorReturn {
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  // Compartments for reconfigurable extensions
  const languageComp = useRef(new Compartment());
  const themeComp = useRef(new Compartment());
  const lineNumbersComp = useRef(new Compartment());
  const wrapComp = useRef(new Compartment());
  const tabSizeComp = useRef(new Compartment());
  const readOnlyComp = useRef(new Compartment());
  const placeholderComp = useRef(new Compartment());
  const heightComp = useRef(new Compartment());

  // Build height theme extension
  function buildHeightExtension(min?: number, max?: number): Extension {
    const styles: Record<string, string> = {};
    if (min) styles.minHeight = `${min}px`;
    if (max) styles.maxHeight = `${max}px`;
    if (Object.keys(styles).length === 0) return [];
    return EditorView.theme({
      "&": { ...(max ? { maxHeight: `${max}px` } : {}) },
      ".cm-scroller": { overflow: "auto", ...styles },
    });
  }

  // Create the editor on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        onChangeRef.current?.(update.state.doc.toString());
      }
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main;
        const line = update.state.doc.lineAt(pos.head);
        onCursorChangeRef.current?.({
          line: line.number,
          col: pos.head - line.from + 1,
          selectionLength: Math.abs(pos.to - pos.from),
        });
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        // Compartmentalized extensions
        languageComp.current.of(resolveLanguageExtension(language)),
        themeComp.current.of(resolveThemeExtensions(theme)),
        lineNumbersComp.current.of(lineNumbers ? [lineNumbersExt(), highlightActiveLineGutter()] : []),
        wrapComp.current.of(wordWrap ? EditorView.lineWrapping : []),
        tabSizeComp.current.of(EditorState.tabSize.of(tabSize)),
        readOnlyComp.current.of(EditorState.readOnly.of(readOnly)),
        placeholderComp.current.of(placeholder ? placeholderExt(placeholder) : []),
        heightComp.current.of(buildHeightExtension(minHeight, maxHeight)),
        // Static extensions
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        updateListener,
        ...(additionalExtensions ?? []),
      ],
    });

    const view = new EditorView({ state, parent: container });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount/unmount — compartments handle reconfig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
      isExternalUpdate.current = false;
    }
  }, [value]);

  // Reconfigure language
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const def = getLanguage(language);
    if (!def) {
      view.dispatch({ effects: languageComp.current.reconfigure([]) });
      return;
    }

    const result = def.support();
    if (result instanceof Promise) {
      result.then((ext) => {
        if (viewRef.current) {
          viewRef.current.dispatch({ effects: languageComp.current.reconfigure(ext) });
        }
      });
    } else {
      view.dispatch({ effects: languageComp.current.reconfigure(result) });
    }
  }, [language]);

  // Reconfigure theme
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeComp.current.reconfigure(resolveThemeExtensions(theme)) });
  }, [theme]);

  // Reconfigure line numbers
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: lineNumbersComp.current.reconfigure(
        lineNumbers ? [lineNumbersExt(), highlightActiveLineGutter()] : [],
      ),
    });
  }, [lineNumbers]);

  // Reconfigure word wrap
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: wrapComp.current.reconfigure(wordWrap ? EditorView.lineWrapping : []),
    });
  }, [wordWrap]);

  // Reconfigure tab size
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: tabSizeComp.current.reconfigure(EditorState.tabSize.of(tabSize)),
    });
  }, [tabSize]);

  // Reconfigure read-only
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyComp.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Reconfigure placeholder
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: placeholderComp.current.reconfigure(placeholder ? placeholderExt(placeholder) : []),
    });
  }, [placeholder]);

  return { view: viewRef.current };
}
