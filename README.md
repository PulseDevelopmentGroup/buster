# buster

Discord bot built with the Sapphire Framework (Discord.js v14).

## Quick start

Prereqs
- Bun installed
- GraphicsMagick installed (for image commands)
- Chromium available if enabling the iFunny listener (Puppeteer)

Setup
1. Copy `.env.example` to `.env` and set:
   - `BUSTER_BOT_TOKEN`
2. Install deps:
```bash
bun install
```
3. Run in dev:
```bash
bun run dev
```

Build
```bash
bun run build           # builds to dist/buster
./dist/buster           # run compiled binary
```

Lint/format (Biome)
```bash
bun run lint
bun run format
```

## Configuration

Environment (see `.env.example`, `.env.development`)
- Required: `BUSTER_BOT_TOKEN`, `BUSTER_BOT_CONFIG`
- Optional: `BUSTER_BOT_PREFIX`, `BUSTER_BOT_DATA_PATH`, logging flags
- Feature keys: `BUSTER_WEB_TENOR_TOKEN`, `BUSTER_WEB_PERSPECTIVE_API_KEY`, `PUPPETEER_EXECUTABLE_PATH`

JSON config: `data/config.json`
- `owners`: string[]
- `listeners.<Name>.enabled`: boolean
- `commands.<name>.options`: Sapphire CommandOptions
- `commands.<name>.vars`: per-command tunables

## Project structure & conventions

- Entry: `src/main.ts` creates the SapphireClient and logs in.
- Config: `src/lib/config.ts` provides `config.env` and `config.json`.
  - Use `config.applyConfig("<name>", defaults)` in `@ApplyOptions` for commands.
- Commands: `src/commands/<Category>/<name>.ts` implement `messageRun`.
- Listeners: `src/listeners/**`; enable/disable via `config.json.listeners` in `onLoad()`.
- Preconditions: `src/preconditions/**` (e.g., `OwnerOnly`, `NoThreads`).
- Utilities/constants: `src/lib/utils.ts`, `src/lib/constants.ts`.
- Static assets: `src/assets/**`.

## Docker

`Dockerfile` builds and runs with GraphicsMagick and Chromium. Provide the same `BUSTER_*` env vars.