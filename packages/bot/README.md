# buster

## Resources

### Guides

The guides for D.js and Sapphire seem pretty sparse, but some of the better docs can be found at:

- Getting Started: https://deploy-preview-711--discordjs-guide.netlify.app/sapphire/
- Other resources hopefully coming soon?

### API References

- **[@sapphire/framework](https://sapphiredev.github.io/framework/)**
- **[@sapphire/utilities](https://sapphiredev.github.io/utilities/)**
- [@sapphire/plugin-editable-commands](https://sapphiredev.github.io/plugins/modules/_sapphire_plugin_editable_commands.html)
- [@sapphire/plugin-api](https://sapphiredev.github.io/plugins/modules/_sapphire_plugin_api.html)
- [@sapphire/plugin-logger](https://sapphiredev.github.io/plugins/modules/_sapphire_plugin_logger.html)
- [@sapphire/plugin-subcommands](https://sapphiredev.github.io/plugins/modules/_sapphire_plugin_subcommands.html)

## Development

### Getting started:

1. `npm install`
2. Set up your `.env.local` file (see below)
3. In VS Code, hit F5 to start up with debugging & hot reloading. Alternatively, you can use `npm run watch:start` to run it via CLI.

### Enviornment

At a _minimum_ `.env.local` must include `BUSTER_BOT_TOKEN`. Optionally, it can include other fields overriding things in `.env.development` or where necessary as documented in `.env.example`.

Minimum `.env.local`:

```
# Bot Token (Vault)
BUSTER_BOT_TOKEN=
```

### Config

The bot is currently reliant on a `config.json` either hosted at a URL or on the filesystem. The minimum config looks something like:

```json
{
  "owners": [123456...],
}
```

## Project Structure

I'm gonna be honest, this bot relies on _a lot_ of magic behind the scenes (which I'm personally not a fan of). This section hopes to unmistify some of that magic.

### Base Project Directory

Should contain general configs, including:

- `.env` file(s)
- `Dockerfile` for container builds
- `.dockerignore`
- `data/config.json` for bot config (unless a URL is specified)
- Any other config files or DB's

### `src/`

Where the code is located, with `index.ts` being the main file and `setup.ts` being any code that is ran _immediately_ upon launch.

### `src/commands/`

_[Command Class](https://sapphiredev.github.io/framework/classes/Command.html)_

Where command files are placed. Files can be placed directly in the `commands/` directory (`//TODO: Fact check this`), or in subdirectories to categorize them.

Very basic command template:

```ts
import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import type { Message } from "discord.js";

@ApplyOptions<CommandOptions>({
  description: "ping pong",
})
export class UserCommand extends Command {
  public async run(message: Message) {
    return message.channel.send("Pong!");
  }
}
```

### `src/lib/`

Utility and shared components used in the rest of the application. It is possible the contents of this directory will be reduced into the root `src/` folder to simplify things later.

### `src/listeners/`

_[Listener Class](https://sapphiredev.github.io/framework/classes/Listener.html)_

Event listener code. Honestly, I'm still not entirely sure how these work, but the gist is that these work in a similar way to that of commands, except they listen for other events listed [here](https://sapphiredev.github.io/framework/modules.html#Events).

### `src/preconditions/`

_[Preconditions Interface](https://sapphiredev.github.io/framework/interfaces/Preconditions.html)_

Precondition code. Once again, not entirely sure how this works, but it seems to be code that gets called before commands, determining whether or not they're allowed to run.

### `src/routes/`

_[Plugin-API](https://sapphiredev.github.io/plugins/modules/_sapphire_plugin_api.html)_

Code for handling HTTP API requests. Although unused now, this could be a great way to write web integrations with CF Workers, Pages, and/or maybe some sort of file hosting?

### `data/`

Data folder for holding database files, configs, or static assets
