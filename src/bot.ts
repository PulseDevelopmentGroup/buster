import dotenv from "dotenv";
dotenv.config();

import Discord from "discord.js";

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

const client = new Discord.Client();

client.once("ready", () => {
  console.log("Rarin' to go!");
});

client.on("message", (message) => {
  const { prefix } = config;

  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift()?.toLowerCase();

  if (message.content === "!ping") {
    message.channel.send("pong!");
  } else if (command === "args-info") {
    if (!args.length) {
      return message.channel.send("No arguments provided");
    }

    message.channel.send(`Args: ${args}`);
  }
});

client.login(config.botToken);
