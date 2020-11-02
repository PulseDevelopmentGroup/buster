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

  const fields = [
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

  let commandInfo: Partial<CommandInfo> = {};

  fields.forEach((field) => {
    const v: CommandInfo[typeof field] =
      info[field] ?? config.commands[info.name].options[field];

    if (v) {
      const ci = commandInfo[field];
      (commandInfo as any)[field] = v;
    }
  });

  /*
  let ret = {
    name: info.name,
    aliases: info.aliases ?? config.commands[info.name].options.aliases,
    autoAliases:
      info.autoAliases ?? config.commands[info.name].options.autoAliases,
    group: info.group ?? config.commands[info.name].options.group,
    memberName:
      info.memberName ?? config.commands[info.name].options.memberName,
    description:
      info.description ?? config.commands[info.name].options.description,
    format: info.format ?? config.commands[info.name].options.format,
    details: info.details ?? config.commands[info.name].options.details,
    examples: info.examples ?? config.commands[info.name].options.examples,
    guildOnly: info.guildOnly ?? config.commands[info.name].options.guildOnly,
    ownerOnly: info.ownerOnly ?? config.commands[info.name].options.ownerOnly,
    clientPermissions:
      info.clientPermissions ??
      config.commands[info.name].options.clientPermissions,
    userPermissions:
      info.userPermissions ??
      config.commands[info.name].options.userPermissions,
    nsfw: info.nsfw ?? config.commands[info.name].options.nsfw,
    throttling:
      info.throttling ?? config.commands[info.name].options.throttling,
    defaultHandling:
      info.defaultHandling ??
      config.commands[info.name].options.defaultHandling,
    args: info.args ?? config.commands[info.name].options.args,
    argsPromptLimit:
      info.argsPromptLimit ??
      config.commands[info.name].options.argsPromptLimit,
    argsType: info.argsType ?? config.commands[info.name].options.argsType,
    argsCount: info.argsCount ?? config.commands[info.name].options.argsCount,
    argsSingleQuotes:
      info.argsSingleQuotes ??
      config.commands[info.name].options.argsSingleQuotes,
    patterns: info.patterns ?? config.commands[info.name].options.patterns,
    guarded: info.guarded ?? config.commands[info.name].options.guarded,
    hidden: info.hidden ?? config.commands[info.name].options.hidden,
    unknown: info.unknown ?? config.commands[info.name].options.unknown,
  };*/

  return commandInfo as CommandInfo;
}
