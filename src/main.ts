import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-hmr/register";

import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";
import { config } from "./lib/config";
import { logger } from "./lib/logger";

const main = async () => {
  const env = config.env;

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
    hmr: {
      enabled: env.development,
    },
  });

  try {
    logger.bot.info("Starting...");
    await client.login(config.env.botToken);
    logger.bot.info("Started.");
  } catch (error) {
    client.destroy();
    logger.bot.error(error);
  }
};

main();
