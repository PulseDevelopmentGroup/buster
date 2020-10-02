import dotenv from "dotenv";
dotenv.config();

import Discord from "discord.js";
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

client.login(process.env.BOT_TOKEN);
