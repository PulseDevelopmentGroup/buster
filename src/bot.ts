import dotenv from "dotenv";
import { CommandoClient } from "discord.js-commando";
import * as util from "./util";
import path from "path";
import got from "got";
import fs from "fs";

/* Define Types */
type environment = {
  token: string;
  config: string;
  prefix: string;
};

/*
type configuration = {
  owners: string[];
};
*/

/* Global Vars */
let env = {} as environment;
let config: any = {};

// init is called before the main function to setup configurations
// There are more concise ways to do this, but this is more readable
init().then(main);

async function init() {
  dotenv.config();

  env = {
    token: process.env.BOT_TOKEN!,
    config: process.env.CONFIG_URL!,
    prefix: process.env.PREFIX ?? "!",
  };

  if (!env.token || !env.config) {
    console.error("BOT_TOKEN and/or CONFIG_URL are not defined.");
    process.exit();
  }

  try {
    if (util.isURL(env.config)) {
      const response = await got.get(env.config);
      config = JSON.parse(response.body);
    } else {
      config = JSON.parse(
        fs.readFileSync(path.join(__dirname, env.config)).toString()
      );
    }
  } catch (error) {
    console.error(`Unable to load config file. ${error}`);
    process.exit();
  }
}

function main() {
  const client = new CommandoClient({
    commandPrefix: env.prefix,
    owner: config.owners,
  });

  client.once("ready", () => {
    console.log("Rarin' to go!");
  });

  client.registry
    .registerGroups([["utils", "Yanno, useful stuff"]])
    .registerDefaults()
    .registerCommandsIn({
      // read all the commands that end in js or ts.
      // basically, a hack to work around https://github.com/discordjs/Commando/issues/297
      filter: /^([^.].*)\.(js|ts)$/,
      dirname: path.join(__dirname, "commands"),
    });

  client.login(env.token);
}
