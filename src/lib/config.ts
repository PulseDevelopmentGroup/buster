import type { CommandOptions } from "@sapphire/framework";
import { CommandOptionsFields } from "./constants";
import { isURL } from "./utils";
import got from "got";
import fs from "fs";
import * as dotenv from "dotenv-cra";

/* ===== Types ===== */

// Enviroment
export interface Environment {
  development: boolean;
  botToken: string;
  prefix: string;
  config: string;
  tenorToken?: string;
  perspectiveApiKey?: string;
  githubApiKey?: string;
}

// Configuration
export interface Configuration {
  owners: string[];
  commands: Record<string, Command>;
}

// Command
interface Command {
  options: CommandOptions;
  vars: Record<string, any>;
}

/* ===== Exported Variables ===== */
export let env: Environment;
export let config: Configuration;

/* ===== Functions ===== */

// Build Environment object from the enviornment variables
export function loadEnvironment() {
  // Set NODE_ENV to development if not already set
  process.env.NODE_ENV ??= "development";

  // Parse enviornment variables from .env
  // Note: .env.local and .env.development can be used as overrides
  // All enviornemnt variables related to the bot should be prefixed with `BUSTER_`
  dotenv.config({ prefix: "BUSTER_" });

  env = {
    botToken: process.env.BUSTER_BOT_TOKEN!,
    config: process.env.BUSTER_BOT_CONFIG!,
    development: process.env.NODE_ENV === "development",
    prefix: process.env.BUSTER_BOT_PREFIX ?? "!",
    tenorToken: process.env.BUSTER_WEB_TENOR_TOKEN,
    perspectiveApiKey: process.env.BUSTER_WEB_PERSPECTIVE_API_KEY,
    githubApiKey: process.env.BUSTER_WEB_GITHUB_API_KEY,
  };

  if (!env.botToken || !env.config) {
    throw new Error("Missing bot token or config URL");
  }

  loadConfig(env.config);
}

/**
 * Build the Configuration object from the config file
 * Note: This is called automaticlly by loadEnvironment,
 * it should only be called again if the config file has changed.
 * @param configPath A path or URL to config.json
 */
export async function loadConfig(configPath: string) {
  if (isURL(configPath)) {
    const response = await got.get(env.config);
    config = JSON.parse(response.body);
  } else {
    config = JSON.parse(fs.readFileSync(env.config).toString());
  }
}

/**
 * Builds CommandOptions object by merging the specified options and
 * those found in the configuration file
 * @param opts The hard-coded options to merge with the config file
 * @returns A merged CommandOptions object
 */
export function setOpts(opts: CommandOptions): CommandOptions {
  /* Make sure name is specified (In theory, we should never get this far) */
  if (opts.name == undefined) {
    return opts;
  }

  let name = opts.name;

  /* Make sure the command object exists in JSON */
  const options = config.commands[name];
  if (!options || !Object.keys(options).length) {
    return opts;
  }

  let commandOpts: Partial<CommandOptions> = {};

  /* Iterate through CommandOptions fields and set values */
  CommandOptionsFields.forEach((field) => {
    const v: CommandOptions[typeof field] =
      opts[field] ?? config.commands[name].options[field];

    if (v) {
      (commandOpts as any)[field] = v;
    }
  });

  return commandOpts as CommandOptions;
}
