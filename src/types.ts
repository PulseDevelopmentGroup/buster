import type { CommandOptions } from "@sapphire/framework";

export interface Environment {
  dev: boolean;
  botToken: string;
  config: string;
  prefix: string;
  dbPath: string;
  version: string;
  tenorApiKey: string | undefined;
  githubApiKey: string | undefined;
  perspectiveApiKey: string | undefined;
}

export interface Configuration {
  owners: string[];
  commands: Record<string, Command>;
}

interface Command {
  options: CommandOptions;
  vars: Record<string, any>;
}
