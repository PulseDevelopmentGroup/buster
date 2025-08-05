// Initialize application dependencies
import "reflect-metadata";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";

// Inspection stuff
// TODO: What does this do?
import { inspect } from "node:util";

inspect.defaultOptions.depth = 1;

import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, OAuth2Scopes } from "discord.js";
// Bot initialization
import { config } from "./lib/config";
import { logger } from "./lib/logger";

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

  const tasks = {
    bull: {
      connection: {
        host: config.env.dbRedisHost,
        port: config.env.dbRedisPort,
        db: config.env.dbRedisDB,
      },
    },
  };

  const client = new SapphireClient({
    defaultPrefix: env.prefix,
    regexPrefix: /^((hey|yo) +)?(bot|buster)[,! ]/i,
    caseInsensitiveCommands: true,
    loadDefaultErrorListeners: env.development,
    loadMessageCommandListeners: true,
    shards: "auto",
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
    ],
    // API should be accessible at /api/oauth/callback but it doesn't seem to work
    // Probably something to work on in the future
    api: {
      auth: {
        id: env.httpAuthId,
        secret: env.httpAuthSecret,
        cookie: "SAPPHIRE_AUTH",
        redirect: env.httpFrontendUrl,
        scopes: [OAuth2Scopes.Identify],
        transformers: [],
      },
      prefix: "api/",
      origin: "*",
      listenOptions: {
        port: env.httpPort,
      },
    },
    tasks,
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
