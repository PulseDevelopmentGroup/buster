import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";
import "reflect-metadata";

import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, OAuth2Scopes, Partials } from "discord.js";
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
    loadMessageCommandListeners: true,
    loadDefaultErrorListeners: env.development,
    shards: "auto",
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildExpressions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
    ],
    partials: [Partials.Message, Partials.Channel],
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
