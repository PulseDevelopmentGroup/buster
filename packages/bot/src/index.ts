// Initialize application dependencies
import "reflect-metadata";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";

// Imports
import { inspect } from "util";

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Imports
import { botConfig } from "./lib/config";
import { SapphireClient } from "@sapphire/framework";
import { logger } from "./lib/logger";

const env = botConfig.env;

// Initialize the client
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

// Main async routine that connects to Discord and offically starts the bot
const main = async () => {
  try {
    logger.info("Logging in");
    await client.login(env.botToken);
    logger.info("Logged in");
  } catch (error) {
    client.destroy();
    logger.error(error);
  }
};

main();
