import type { ApplicationCommandRegistry } from "@sapphire/framework";
import type { SlashCommandBuilder } from "discord.js";
import { config } from "./config";

export function registerSlash(
  registry: ApplicationCommandRegistry,
  builder: (builder: SlashCommandBuilder) => SlashCommandBuilder,
): void {
  const devGuilds = config.env.devGuildIds;
  if (devGuilds && devGuilds.length > 0) {
    for (const guildId of devGuilds) {
      registry.registerChatInputCommand(builder, { guildIds: [guildId] });
    }
  } else {
    registry.registerChatInputCommand(builder);
  }
}
