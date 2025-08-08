# Copilot instructions for this repo (buster)

These notes make AI agents productive fast in this Sapphire (Discord.js v14) bot.

## Standards (non‑negotiable)
- TypeScript everywhere: keep code fully typed. Avoid `any`/`unknown` escape hatches. New code must pass `tsc --noEmit`.
- Bun, not npm: use `bun run <script>` and write code compatible with Bun. Prefer `bunx` for CLIs if needed.
- Biome for lint/format: run `bun run lint` and `bun run format` before calling work complete.
- Static assets live in `src/assets` (e.g., `src/assets/fry/*.png`).

## Big picture
- Entry: `src/main.ts` creates a SapphireClient, registers Sapphire plugins (API, editable-commands, HMR), sets prefixes, intents/partials, and logs in with `config.env.botToken`.
- Config source of truth: `src/lib/config.ts` loads a JSON config (file path or URL) from `BUSTER_BOT_CONFIG`. It exposes:
  - `config.env`: environment variables (prefix, tokens, logging switches, HTTP options…).
  - `config.json`: JSON configuration with `owners`, `listeners`, and per-command `commands.<name> = { options, vars }`.
  - `config.applyConfig(name, defaults)`: merge Sapphire `CommandOptions` with config JSON (use this pattern for all commands).
- Globals: `config` and `logger` singletons in `src/lib/config.ts` and `src/lib/logger.ts` (Winston). Use `logger.bot` for lifecycle logs and `logger.command` for command logs.

## Conventions and patterns (use these in new code)
- Commands live under `src/commands/<Category>/<name>.ts`, extend `Command`, implement `messageRun` (message-based, not slash). Always decorate with `@ApplyOptions(config.applyConfig("<name>", { ... }))`.
  - Example: `src/commands/Fun/gif.ts` pulls defaults + JSON `commands.gif.vars` and uses `TENOR_URL` with `config.env.tenorToken`.
  - Example with assets/image processing: `src/commands/Images/deepfry.ts` reads `config.json.commands.fry.vars` and uses Jimp + GraphicsMagick (gm).
- Listeners extend `Listener` and toggle enablement from JSON: check `onLoad()` and set `this.enabled = config.json.listeners[this.name]?.enabled ?? false;` (see `src/listeners/iFunnyFixer.ts`). Heavy resources (Puppeteer browser) are created in `onLoad` and cleaned per-use.
- Preconditions live in `src/preconditions`. `OwnerOnly` checks `config.json.owners`; `NoThreads` blocks thread channels. Reference by name in `preconditions: ["OwnerOnly"]`.
- Utilities/constants: use `src/lib/utils.ts` (URL/image helpers) and `src/lib/constants.ts` (regexes, URLs, embed color). Prefer these over ad‑hoc regex/strings.
- Replies: prefer `@sapphire/plugin-editable-commands` `send(msg, ...)` and check `message.channel.isSendable()` when sending embeds/files (see `help.ts`, `deepfry.ts`).

## Developer workflows
- Install deps: `bun install` (repo targets Bun + TS ESNext; tsconfig extends `@sapphire/ts-config`).
- Dev run (HMR): `bun run dev` (HMR enabled when `NODE_ENV=development`). Debug: `bun run dev:debug`.
- Typecheck only: `bunx tsc --noEmit`.
- Build: `bun run build` (runs `tsc --noEmit` then `bun build --compile` to `dist/buster`). Run built binary via `./dist/buster`.
- Lint/format: `bun run lint` and `bun run format` (Biome).
- Docker: see `Dockerfile` (build stage compiles; runtime installs GraphicsMagick and Chromium; sets `PUPPETEER_EXECUTABLE_PATH`).

## Required config/env
- Minimal: set `BUSTER_BOT_TOKEN` and `BUSTER_BOT_CONFIG` (path like `data/config.json` or a URL). See `.env.example` and `.env.development`.
- Feature keys: `BUSTER_WEB_TENOR_TOKEN` for `gif`, `BUSTER_WEB_PERSPECTIVE_API_KEY` for `intent`. `PUPPETEER_EXECUTABLE_PATH` may be needed in some environments (see `iFunnyFixer`).
- Image commands require system GraphicsMagick available to the `gm` module.

## When adding features
- New command: create `src/commands/<Category>/<name>.ts`, export class extends `Command` with `@ApplyOptions(config.applyConfig("<name>", { description, preconditions, ... }))`. Put tunables (numbers/flags) in `data/config.json -> commands.<name>.vars`.
- New listener: gate enablement via `config.json.listeners.<ListenerName>.enabled`; do heavy init in `onLoad`.
- Logging: use `logger.bot` for startup/shutdown/errors; `logger.command` for per-command events.

## Examples to reference
- Commands: `Fun/gif.ts`, `Fun/inspire.ts`, `Images/deepfry.ts`, `Tool/intent.ts`, `Tool/help.ts`.
- Listeners: `iFunnyFixer.ts`, `listeners/commands/commandLogger.ts`.
- Preconditions: `preconditions/OwnerOnly.ts`, `preconditions/NoThreads.ts`.
- Config file shape: `data/config.json`.
