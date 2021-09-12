import type { CommandOptions } from "@sapphire/framework";
import type { Environment, Configuration } from "./types";
import { ConfigNotFoundError } from "./models";
import { isURL } from "./util";
import dotenv from "dotenv";
import got from "got";
import fs from "fs";

export let env: Environment;
export let config: Configuration;

export async function getConfig() {
  dotenv.config();

  env = {
    botToken: process.env.BOT_TOKEN!,
    tenorApiKey: process.env.TENOR_TOKEN,
    perspectiveApiKey: process.env.PERSPECTIVE_API_KEY,
    githubApiKey: process.env.GITHUB_API_KEY,
    config:
      process.env.CONFIG_URL ??
      "https://raw.githubusercontent.com/PulseDevelopmentGroup/buster/main/data/config.json",
    dbPath: process.env.DB_PATH ?? "data/database.db",
    prefix: process.env.PREFIX ?? "!",
    version: process.env.VERSION ?? "0.0.0",
  };

  if (!env.botToken) {
    throw new ConfigNotFoundError("BOT_TOKEN is not defined");
  }

  if (isURL(env.config)) {
    const response = await got.get(env.config);
    config = JSON.parse(response.body);
  } else {
    config = JSON.parse(fs.readFileSync(env.config).toString());
  }
}

const optionFields = [
  "aliases",
  "name",
  "cooldownDelay",
  "cooldownFilteredUsers",
  "cooldownLimit",
  "cooldownScope",
  "description",
  "detailedDescription",
  "enabled",
  "flags",
  "fullCategory",
  "generateDashLessAliases",
  "nsfw",
  "options",
  "preconditions",
  "prefixes",
  "quotes",
  "requiredClientPermissions",
  "requiredUserPermissions",
  "runIn",
  "separators",
] as (keyof CommandOptions)[];

export function setupCommand(opts: CommandOptions): CommandOptions {
  let name = opts.name ?? "";

  /* Make sure name is specified (In theory, we should never get this far) */
  if (!name) {
    return opts;
  }

  /* Make sure the command object exists in JSON */
  const options = config.commands[name];
  if (!options || !Object.keys(options).length) {
    return opts;
  }

  let commandOptions: Partial<CommandOptions> = {};

  /* Iterate through CommandInfo fields and set values */
  optionFields.forEach((field) => {
    const v: CommandOptions[typeof field] =
      opts[field] ?? config.commands[name].options[field];

    if (v) {
      (commandOptions as any)[field] = v;
    }
  });

  return commandOptions as CommandOptions;
}
