# Changelog

All notable changes to `@particle-academy/fancy-code` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

> **Pre-1.0:** breaking changes land in MINOR releases. Until 1.0 the minor
> number is not a compatibility promise — read the entry, not the version.

> This file starts here. Earlier releases predate it and were never written up;
> `git log` is the record for those. It is not backfilled rather than
> guessed-at, because a changelog that invents its own history is worse than one
> that admits where it begins.

## [Unreleased]

## [0.10.0] — 2026-08-07

### Changed

- **BREAKING — Node 22 is now declared as the floor.** `engines.node` is `>=22`, where this package previously declared **nothing at all**.

  Declaring nothing was not the same as supporting old Node: a consumer on 18 installed cleanly and found out at runtime.

  **What you must do:** on Node 22 or newer, nothing. Note npm only *warns* on an `engines` mismatch while **pnpm fails the install**, so this surfaces differently depending on your package manager. Node 18 is end-of-life and 20 is maintenance-only.

- **BREAKING — React 18 is no longer supported.** `peerDependencies.react` / `react-dom` are now `^19.0.0`.

  **What you must do:** on React 19, nothing. On React 18, stay on the previous release, or upgrade your app to 19 first.

  React 18 support was a claim nothing tested — every build and test in this package ran against 19, so the 18 half of the old range was never executed. An untested compatibility claim is worse than an absent one, because it reads as support.

### Why

These are the kit 0.5 platform floors, applied across every package at once so a consumer never has to resolve a mix. **No API changed, nothing was removed, nothing was renamed** — only what the package requires.


## [0.9.1] — 2026-07-28

### Fixed

- **`CodeEditorPanel` crashed when the editor engine arrived after first
  render.** `if (!engine) return null` sat above the `useMemo` that builds the
  gutter, so a render without an engine ran zero hooks and the next ran one —
  React desyncs on the changed count and throws from inside itself.
  `_engineReturn` is typed `| null` and starts null, so any host rendering the
  panel before the engine settles hit this.

  **No action needed** — the fix is internal and the API is unchanged.

### Added

- `jsdom` as a devDependency, and the first component test in this package.
  There was previously no way to render a component in a test here at all, which
  is precisely how the bug above shipped.

### Changed

- Widened the `@particle-academy/fancy-file-commons` requirement from `^0.2.0` to
  `>=0.2 <2.0`, so a sibling minor release is an upgrade and not a resolver
  conflict. **No action needed** — widening a range only adds candidates; the
  version you have today still resolves.

  A caret on a `0.x` range locks the MINOR, so this pinned a sibling at
  whatever it happened to be on the day it was written, and each sibling
  release then read as a conflict to the resolver rather than an upgrade.
  Nothing here was using an API the newer minors removed — the range was the
  whole problem.
