import type { CSSProperties } from "react";
import type { MediaViewerProps } from "@particle-academy/react-fancy";
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
  /** Editor height bounds (px). */
  minHeight?: number;
  maxHeight?: number;
  /** Extra props forwarded to `<MediaViewer>` for media files. */
  mediaProps?: Partial<Omit<MediaViewerProps, "src" | "mime" | "alt">>;
  className?: string;
  style?: CSSProperties;
}
