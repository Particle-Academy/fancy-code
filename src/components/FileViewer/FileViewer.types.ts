import type { CSSProperties } from "react";
import type { FauxClientProps, MediaViewerProps } from "@particle-academy/react-fancy";
import type { FileKind } from "../../file-type";

export interface FileViewerProps {
  /**
   * File name or path — used to detect the file kind / editor language, and as
   * a label / alt text. Pass `mime` too when you have it (it's preferred).
   */
  filename?: string;
  /** MIME type — preferred over `filename` for detection. */
  mime?: string;
  /**
   * Source URL for **media** files (image / video / audio / PDF) —
   * `http(s):` / `data:` / `blob:`. Required when the file resolves to media.
   */
  src?: string;
  /** Text content for **text** files. */
  value?: string;
  /** Called when text content changes (ignored when `readOnly`). */
  onChange?: (value: string) => void;
  /**
   * Read-only. Defaults to `true` — `FileViewer` is a viewer. Media is always
   * read-only regardless. Set `false` (with `onChange`) to edit text.
   */
  readOnly?: boolean;
  /** Editor theme for text: `"light" | "dark" | "auto"` or a registered name (default `"auto"`). */
  theme?: string;
  /** Force the file kind, bypassing detection. */
  fileKind?: FileKind;
  /** Show line numbers in the text editor (default `true`). */
  lineNumbers?: boolean;
  /** Wrap long lines in the text editor (default `false`). */
  wordWrap?: boolean;
  /**
   * 1-based line to land on: scrolled to the middle of the view, caret placed,
   * and highlighted. Applied on mount and again whenever it changes, so
   * re-targeting an open file scrolls again. Text files only; does not steal focus.
   */
  line?: number;
  /** 1-based column for {@link line} (default 1). */
  column?: number;
  /**
   * Lines to highlight. Defaults to `[line]` when `line` is set; pass your own
   * (a range, several hits) to override, or `[]` to land without highlighting.
   */
  highlightLines?: readonly number[];
  /** Editor height bounds (px). */
  minHeight?: number;
  maxHeight?: number;
  /** Extra props forwarded to `<MediaViewer>` for media files. */
  mediaProps?: Partial<Omit<MediaViewerProps, "src" | "mime" | "alt">>;
  /**
   * How a **document** (Markdown, HTML, plain text) is shown. `"rendered"`
   * (default): as a reader sees it, through react-fancy's `ContentRenderer`
   * (sanitised; a file is untrusted). `"source"`: in the code editor. Editing
   * (`readOnly={false}`) and landing on a `line` always show the source.
   */
  view?: "rendered" | "source";
  /**
   * Passed to the react-fancy `FauxClient` frame a rendered file sits in (zoom
   * and full screen, revealed on hover): `variant`, a controlled `zoom`, …
   */
  frameProps?: Partial<FauxClientProps>;
  className?: string;
  style?: CSSProperties;
}
