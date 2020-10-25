import { Environment, Configuration } from "./types";
import { isURL } from "./util";
import path from "path";
import got from "got";
import fs from "fs";

export let env: Environment;
export let config: Configuration;

// TODO: Errors should eventually be floated up to bot.ts for handling there
// @JosNun: Maybe you could handle that?
export async function getConfig() {
  env = {
    botToken: process.env.BOT_TOKEN!,
    tenorToken: process.env.TENOR_TOKEN!,
    config: process.env.CONFIG_URL!,
    prefix: process.env.PREFIX ?? "!",
  };

  if (!env.botToken || !env.config) {
    console.error("BOT_TOKEN and/or CONFIG_URL are not defined.");
    process.exit();
  }

  try {
    if (isURL(env.config)) {
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
