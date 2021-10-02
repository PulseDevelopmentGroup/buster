// Initialize application dependencies
import "reflect-metadata";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";

// Inspection stuff
// TODO: What does this do?
import { inspect } from "util";
inspect.defaultOptions.depth = 1;

// Bot initialization
import { config } from "./lib/config";
import { logger } from "./lib/logger";
import { SapphireClient } from "@sapphire/framework";

const main = async () => {
  const env = config.env;

  // Load JSON configuration
  try {
    await config.load();
  } catch {
    console.error(
      "Unable to load JSON file. It may not be in the right location, have the right permissions set, or the URL returned a 404",
    );
    process.exit(1);
  }

  const client = new SapphireClient({
    defaultPrefix: env.prefix,
    regexPrefix: /^((hey|yo) +)?(bot|buster)[,! ]/i,
    caseInsensitiveCommands: true,
    shards: "auto",
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_BANS",
      "GUILD_EMOJIS_AND_STICKERS",
      "GUILD_VOICE_STATES",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
    ],
    // API should be accessible at /api/oauth/callback but it doesn't seem to work
    // Probably something to work on in the future
    api: {
      auth: {
        id: env.httpAuthId,
        secret: env.httpAuthSecret,
        cookie: "SAPPHIRE_AUTH",
        redirect: env.httpFrontendUrl,
        scopes: ["identify"],
        transformers: [],
      },
      prefix: "api/",
      origin: "*",
      listenOptions: {
        port: env.httpPort,
      },
    },
  });

  try {
    logger.bot.info("Logging in");
    await client.login(config.env.botToken);
    logger.bot.info("Logged in");
  } catch (error) {
    client.destroy();
    logger.bot.error(error);
  }
};

main();
