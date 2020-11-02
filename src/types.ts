import { CommandInfo } from "discord.js-commando";

export interface Environment {
  botToken: string;
  tenorToken: string;
  config: string;
  prefix: string;
}

export interface Configuration {
  owners: string[];
  commands: Record<string, Command>;
}

interface Command {
  options: CommandInfo;
  vars: Record<string, any>;
}
