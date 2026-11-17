# Contributing to @particle-academy/fancy-code

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

## Commands

```bash
npm run build   # Build with tsup (ESM + CJS + DTS)
npm run dev     # Watch mode
npm run lint    # tsc --noEmit && eslint .
npm test        # vitest run
npm run clean   # Remove dist/
```

Tests sit beside the code as `src/**/*.test.ts(x)`.

Update `CHANGELOG.md` in the same commit as the change.
