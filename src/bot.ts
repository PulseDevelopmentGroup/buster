import { LogLevel, SapphireClient } from "@sapphire/framework";
import { getConfig, env } from "./config";

// Create the client
const client = new SapphireClient({
  defaultPrefix: "!",
  regexPrefix: /^(hey +)?buster[,! ]/i,
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug,
  },
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
});

// Handle fatal issues during launch
const badStart = (e: Error | unknown) => {
  client.logger.fatal(e);
  client.destroy();
  process.exit(1);
};

// Main function, starts the bot and logs in
const main = async () => {
  try {
    client.logger.info("Starting bot...");
    await client.login(env.botToken);
    client.logger.info("Bot started!");
  } catch (e) {
    badStart(e);
  }
};

// getConfig is called first to load config, then the bot is started
getConfig()
  .catch((e) => badStart(e))
  .then(main);
