import dotenv from "dotenv";
dotenv.config();

import Discord from "discord.js";

const config = {
  botToken: process.env.BOT_TOKEN,
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
  console.log(message.content);

  if (message.content === "!ping") {
    message.channel.send("pong!");
  }
});

client.login(config.botToken);
