import { useState } from "react";
import { cn } from "@particle-academy/react-fancy";
import { useCodeEditor } from "./CodeEditor.context";
import { CodeEditorToolbarSeparator } from "./CodeEditorToolbarSeparator";
import { getRegisteredLanguages } from "../../languages";
import type { CodeEditorToolbarProps } from "./CodeEditor.types";

const iconBtnClass =
  "inline-flex items-center justify-center rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

function LanguageSelector() {
  const { language, setLanguage } = useCodeEditor();
  const languages = getRegisteredLanguages();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="h-6 rounded border border-zinc-200 bg-transparent px-1.5 text-[11px] text-zinc-600 outline-none transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  );
}

function DefaultToolbarActions() {
  const { copyToClipboard, toggleWordWrap, wordWrap } = useCodeEditor();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <LanguageSelector />
      <CodeEditorToolbarSeparator />
      <button
        type="button"
        onClick={toggleWordWrap}
        title={wordWrap ? "Disable Word Wrap" : "Enable Word Wrap"}
        className={cn(iconBtnClass, wordWrap && "text-blue-500 dark:text-blue-400")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M3 12h15a3 3 0 110 6h-4" />
          <polyline points="16 16 14 18 16 20" />
          <line x1="3" y1="18" x2="10" y2="18" />
        </svg>
      </button>
      <button type="button" onClick={handleCopy} title="Copy to Clipboard" className={iconBtnClass}>
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </>
  );
}

export function CodeEditorToolbar({ children, className }: CodeEditorToolbarProps) {
  const hasChildren = children != null;

  return (
    <div
      data-fancy-code-toolbar=""
      className={cn(
        "flex items-center gap-0.5 border-b border-zinc-200 px-2 py-1 dark:border-zinc-700",
        className,
      )}
    >
      {hasChildren ? children : <DefaultToolbarActions />}
    </div>
  );
}

CodeEditorToolbar.displayName = "CodeEditorToolbar";
