import dotenv from "dotenv";
dotenv.config();

import path from "path";

import { CommandoClient } from "discord.js-commando";

const config = {
  botToken: process.env.BOT_TOKEN,
  prefix: process.env.PREFIX ?? "!",
};

if (!config.botToken) {
  console.error(
    'No token found. Add "BOT_TOKEN" to .env, or your environment variables'
  );
  process.exit();
}

const owners = process.env.OWNERS?.split(",");

const client = new CommandoClient({
  commandPrefix: config.prefix,
  owner: owners,
});

client.once("ready", () => {
  console.log("Rarin' to go!");
});

client.registry
  .registerGroups([["utils", "Yanno, useful stuff"]])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login(config.botToken);
