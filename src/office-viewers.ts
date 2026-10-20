import type { ComponentType } from "react";
import type { FauxClientProps } from "@particle-academy/react-fancy";
import type { OfficeKind } from "./file-type";

/** What a registered Office viewer is given. */
export interface OfficeViewerProps {
  /** The file's contents as our reader returns them (a dark-slide deck, a holy-sheet workbook, a last-word doc). */
  document: unknown;
  filename?: string;
  /** Passed through from `FileViewer`, for viewers that sit in the FauxClient frame. */
  frameProps?: Partial<FauxClientProps>;
}

export interface OfficeViewerOptions {
  /**
   * Read the raw file in the browser, for when the app has only a URL. Give it
   * our JS reader, e.g. `(bytes) => new PptxReader().read(bytes)`. Without it,
   * a file with no server-read `document` gets the download card.
   */
  read?: (bytes: Uint8Array) => unknown;
}

interface Registration {
  View: ComponentType<OfficeViewerProps>;
  read?: (bytes: Uint8Array) => unknown;
}

const registry = new Map<OfficeKind, Registration>();

/**
 * Show one Office format in `FileViewer` with a kit viewer. Call once at app
 * start, per format you want:
 *
 * ```ts
 * import { registerOfficeViewer } from "@particle-academy/fancy-code";
 * import { DeckFileView } from "@particle-academy/fancy-slides";
 * import { PptxReader } from "@particle-academy/dark-slide";
 *
 * registerOfficeViewer("pptx", DeckFileView, { read: (b) => new PptxReader().read(b) });
 * ```
 *
 * A registry rather than an import because fancy-code must not depend on the
 * slide or sheet packages: an app that has neither (and does not want them)
 * would otherwise fail to build on a file type it never opens.
 */
export function registerOfficeViewer(
  kind: OfficeKind,
  View: ComponentType<OfficeViewerProps>,
  options: OfficeViewerOptions = {},
): void {
  registry.set(kind, { View, read: options.read });
}

/** The viewer registered for a format, if any. */
export function officeViewerFor(kind: OfficeKind): Registration | undefined {
  return registry.get(kind);
}

/** Forget every registration (tests, hot reload). */
export function clearOfficeViewers(): void {
  registry.clear();
}
