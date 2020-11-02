import { ConfigNotFoundError } from "./models";
import { Environment, Configuration } from "./types";
import { CommandInfo } from "discord.js-commando";
import { isURL } from "./util";
import dotenv from "dotenv";
import path from "path";
import got from "got";
import fs from "fs";

export let env: Environment;
export let config: Configuration;

export async function getConfig() {
  dotenv.config();

  env = {
    botToken: process.env.BOT_TOKEN!,
    tenorToken: process.env.TENOR_TOKEN!,
    config: process.env.CONFIG_URL!,
    prefix: process.env.PREFIX ?? "!",
  };

  if (!env.botToken || !env.config) {
    throw new ConfigNotFoundError(
      "BOT_TOKEN and/or CONFIG_URL are not defined."
    );
  }

  if (isURL(env.config)) {
    const response = await got.get(env.config);
    config = JSON.parse(response.body);
  } else {
    config = JSON.parse(
      fs.readFileSync(path.join(__dirname, env.config)).toString()
    );
  }
}

const infoFields = [
  "name",
  "aliases",
  "autoAliases",
  "group",
  "memberName",
  "description",
  "format",
  "details",
  "examples",
  "guildOnly",
  "ownerOnly",
  "clientPermissions",
  "userPermissions",
  "nsfw",
  "throttling",
  "defaultHandling",
  "args",
  "argsPromptLimit",
  "argsType",
  "argsCount",
  "argsSingleQuotes",
  "patterns",
  "guarded",
  "hidden",
  "unknown",
] as (keyof CommandInfo)[];

export function setupCommand(info: CommandInfo): CommandInfo {
  /* Make sure name is specified (In theory, we should never get this far) */
  if (info.name == undefined) {
    return info;
  }

  /* Make sure the command object exists in JSON */
  const options = config.commands[info.name];
  if (!options || !Object.keys(options).length) {
    return info;
  }

  let commandInfo: Partial<CommandInfo> = {};

  /* Iterate through CommandInfo fields and set values */
  infoFields.forEach((field) => {
    const v: CommandInfo[typeof field] =
      info[field] ?? config.commands[info.name].options[field];

    if (v) {
      (commandInfo as any)[field] = v;
    }
  });

  return commandInfo as CommandInfo;
}
