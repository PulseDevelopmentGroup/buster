// Run initialization code first to set up the bot
import "./setup";

// Imports
import { env } from "./lib/config";
import { LogLevel, SapphireClient } from "@sapphire/framework";

// Initialize the client
const client = new SapphireClient({
  defaultPrefix: env.prefix,
  regexPrefix: /^((hey|yo) +)?(bot|buster)[,! ]/i,
  caseInsensitiveCommands: true,
  logger: {
    level: env.development ? LogLevel.Debug : LogLevel.Info,
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

// Main async routine that connects to Discord and offically starts the bot
const main = async () => {
  try {
    client.logger.info("Logging in");
    await client.login(env.botToken);
    client.logger.info("logged in");
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
