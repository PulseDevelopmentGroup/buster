import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type Message,
  type Role,
} from "discord.js";
import { config } from "../../lib/config";
import { registerSlash } from "../../lib/registry";

@ApplyOptions<CommandOptions>(
  config.applyConfig("role", {
    description: "Get, give, and remove roles & permissions",
    preconditions: ["GuildOnly"],
  }),
)
export default class RoleCommand extends Command {
  private buildAvailableRolesEmbed(
    guild: import("discord.js").Guild,
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("Available Roles")
      .setColor("#ffaa00")
      .setDescription("A list of opt-in roles");
    for (const role of guild.roles.cache.values()) {
      if (role.name.startsWith(":")) {
        const name = role.name.slice(1);
        const memberCount = role.members.size;
        embed.addFields([
          { name, value: `${memberCount} members`, inline: true },
        ]);
      }
    }
    return embed;
  }
  public override async messageRun(msg: Message, args: Args) {
    const action = await args.next();
    args.next();
    const role = await args.next();

    if (!msg.guild) {
      return;
    }

    if (!action) {
      const embed = this.buildAvailableRolesEmbed(msg.guild);
      return send(msg, {
        embeds: [embed],
      });
    }

    if (!msg.member) {
      return send(
        msg,
        `Hmm... I can't seem to figure out who sent that message :/`,
      );
    }

    if (["g", "give", "gib"].includes(action)) {
      let guildRole: Role | undefined;

      for (const r of msg.guild.roles.cache.values()) {
        let name = r.name.toLowerCase();
        if (!name.startsWith(":")) {
          continue;
        } else {
          name = name.slice(1);
        }

        if (name === role?.toLowerCase()) {
          guildRole = r;

          break;
        }
      }

      if (!guildRole) {
        return send(
          msg,
          `Unable to find role ${role}. To see a list of available roles, use ${await msg.client.fetchPrefix(
            msg,
          )}role.`,
        );
      }

      msg.member.roles.add(guildRole);

      return send(
        msg,
        `Congrats! You've been given the role ${guildRole.name.substring(
          1,
        )}. Welcome to the team.`,
      );
    }

    if (["t", "take"].includes(action)) {
      let userRole: Role | undefined;

      for (const r of msg.member.roles.cache.values()) {
        let name = r.name.toLowerCase();
        if (!name.startsWith(":")) {
          continue;
        } else {
          name = name.slice(1);
        }

        if (name === role) {
          userRole = r;

          break;
        }
      }

      if (!userRole) {
        return send(
          msg,
          `You don't seem to have the role ${role}. Make sure you have it, then try again.`,
        );
      }

      msg.member.roles.remove(userRole);

      return send(
        msg,
        `I've just revoked the role ${userRole.name.substring(
          1,
        )}. If you'd like it back again, just ask!`,
      );
    }

    return send(msg, "Hmm... I can't understand that. Maybe try again?");
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (
      !interaction.guild ||
      !interaction.member ||
      !("roles" in interaction.member)
    ) {
      return interaction.reply({
        content: "Guild only.",
        flags: ["Ephemeral"],
      });
    }

    const sub = interaction.options.getSubcommand(true);
    if (sub === "list") {
      const embed = this.buildAvailableRolesEmbed(interaction.guild);
      return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    }

    if (sub === "give") {
      const role = interaction.options.getRole("role", true);
      if (!role.name.startsWith(":"))
        return interaction.reply({
          content: "This role is not opt-in.",
          flags: ["Ephemeral"],
        });
      const gm = await interaction.guild.members.fetch(interaction.user.id);
      await gm.roles.add(role.id);
      return interaction.reply({
        content: `Given role ${role.name.substring(1)}.`,
        flags: ["Ephemeral"],
      });
    }

    if (sub === "take") {
      const role = interaction.options.getRole("role", true);
      if (!role.name.startsWith(":"))
        return interaction.reply({
          content: "This role is not opt-in.",
          flags: ["Ephemeral"],
        });
      const gm = await interaction.guild.members.fetch(interaction.user.id);
      await gm.roles.remove(role.id);
      return interaction.reply({
        content: `Removed role ${role.name.substring(1)}.`,
        flags: ["Ephemeral"],
      });
    }

    return interaction.reply({
      content: "Unknown subcommand.",
      flags: ["Ephemeral"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addSubcommand((s) =>
          s.setName("list").setDescription("List opt-in roles"),
        )
        .addSubcommand((s) =>
          s
            .setName("give")
            .setDescription("Give yourself a role")
            .addRoleOption((o) =>
              o.setName("role").setDescription("Role").setRequired(true),
            ),
        )
        .addSubcommand((s) =>
          s
            .setName("take")
            .setDescription("Remove a role from yourself")
            .addRoleOption((o) =>
              o.setName("role").setDescription("Role").setRequired(true),
            ),
        );
      return b;
    });
  }
}
