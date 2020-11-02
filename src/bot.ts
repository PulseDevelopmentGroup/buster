import { CommandoClient } from "discord.js-commando";
import { env, config, getConfig } from "./config";
import path from "path";

// getConfig is called before the main function to setup configurations
// There are more concise ways to do this, but this is more readable
getConfig()
  .catch((e) => {
    console.error(`Unable to load config file. ${e}`);
    process.exit();
  })
  .then(main);

function main() {
  const client = new CommandoClient({
    commandPrefix: env.prefix,
    owner: config.owners,
  });

  client.once("ready", () => {
    console.log("Rarin' to go!");
  });

  client.registry
    .registerGroups([["util", "Bot Management"]])
    .registerGroups([["fun", "Fun and Games"]])
    .registerGroups([["tool", "Tools"]])
    .registerDefaults()
    .registerCommandsIn({
      // read all the commands that end in js or ts.
      // basically, a hack to work around https://github.com/discordjs/Commando/issues/297
      filter: /^([^.].*)\.(js|ts)$/,
      dirname: path.join(__dirname, "commands"),
    });

  client.login(env.botToken);
}
