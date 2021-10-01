import type { CommandOptions } from "@sapphire/framework";
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

  logCommands: boolean;
  logMessages: boolean;

  httpAuthId: string;
  httpAuthSecret: string;
  httpFrontendUrl: string;
  httpPort: number;

  tenorToken?: string;
  perspectiveApiKey?: string;
  githubApiKey?: string;
}

// Configuration
export interface Configuration {
  owners: string[];
  listeners: string[];
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
    botToken: process.env.BUSTER_BOT_TOKEN ?? "",
    config: process.env.BUSTER_BOT_CONFIG ?? "",
    development: process.env.NODE_ENV === "development",
    prefix: process.env.BUSTER_BOT_PREFIX ?? "!",

    logCommands: process.env.BUSTER_LOG_COMMANDS === "true",
    logMessages: process.env.BUSTER_LOG_MESSAGES === "true",

    httpAuthId: process.env.BUSTER_HTTP_AUTH_ID ?? "",
    httpAuthSecret: process.env.BUSTER_HTTP_AUTH_SECRET ?? "",
    httpFrontendUrl:
      process.env.BUSTER_HTTP_FRONTEND_URL ?? "http://localhost:4000",
    httpPort: parseInt(process.env.BUSTER_HTTP_PORT ?? "4000"),

    tenorToken: process.env.BUSTER_WEB_TENOR_TOKEN,
    perspectiveApiKey: process.env.BUSTER_WEB_PERSPECTIVE_API_KEY,
    githubApiKey: process.env.BUSTER_WEB_GITHUB_API_KEY,
  };

  if (!env.botToken || !env.config) {
    throw new Error("Missing bot token or config URL");
  }

  loadConfig(env.config);

  if (env.development) {
    console.log(JSON.stringify(env, null, 2));
    console.log(JSON.stringify(config, null, 2));
  }
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
 * @param commandName The name of the command
 * @param opts The default options for the command
 * @returns A merged CommandOptions object
 */
export function applyConfig(
  commandName: string,
  opts?: CommandOptions,
): CommandOptions {
  return {
    cooldownFilteredUsers: config.owners,
    ...opts,
    ...config.commands[commandName]?.options,
    name: commandName,
  };
}
