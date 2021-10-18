import { MessageEmbed, Role, Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { config } from "../../lib/config";

@ApplyOptions<CommandOptions>(
  config.applyConfig("role", {
    description: "Get, give, and remove roles & permissions",
    preconditions: ["GuildOnly"],
  }),
)
export default class RoleCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    const action = await args.nextMaybe().value;
    const role = await args.nextMaybe().value;

    if (!msg.guild) {
      return;
    }

    if (!action) {
      const embed = new MessageEmbed()
        .setTitle("Available Roles")
        .setColor("#ffaa00")
        .setDescription("A list of opt-in roles");

      for (const role of msg.guild.roles.cache.values()) {
        if (role.name.startsWith(":")) {
          const name = role.name.slice(1);
          const memberCount = role.members.size;

          embed.addField(name, `${memberCount} members`, true);
        }
      }

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
}
