import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageEmbed, Role } from "discord.js";
import { setupCommand } from "../../config";

export default class RoleCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "role",
        group: "tool",
        memberName: "role",
        description: "Get, give, and remove roles & permissions",
        guildOnly: true,
        args: [
          {
            key: "action",
            prompt: "(g)ive or (t)ake a role?",
            type: "string",
            oneOf: ["g", "give", "gib", "t", "take"],
            error: "hmm... I couldn't understand that :(",
            default: "",
          },
          {
            key: "role",
            prompt: "what role would you like to edit?",
            type: "string",
            default: "",
          },
        ],
      })
    );
  }

  async run(
    msg: CommandoMessage,
    {
      action,
      role,
    }: {
      action: "g" | "give" | "gib" | "t" | "take";
      role: string;
    }
  ) {
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

      return msg.embed(embed);
    }

    if (!msg.member) {
      return msg.say(
        `Hmm... I can't seem to figure out who sent that message :/`
      );
    }

    if (["g", "give", "gib"].includes(action)) {
      let guildRole: Role | undefined;

      for (let r of msg.guild.roles.cache.values()) {
        let name = r.name.toLowerCase();
        if (!name.startsWith(":")) {
          continue;
        } else {
          name = name.slice(1);
        }

        if (name === role.toLowerCase()) {
          guildRole = r;

          break;
        }
      }

      if (!guildRole) {
        return msg.say(
          `Unable to find role ${role}. To see a list of available roles, use ${this.client.commandPrefix}role.`
        );
      }

      msg.member.roles.add(guildRole);

      return msg.say(
        `Congrats! You've been given the role ${guildRole.name.substring(
          1
        )}. Welcome to the team.`
      );
    }

    if (["t", "take"].includes(action)) {
      let userRole: Role | undefined;

      for (let r of msg.member.roles.cache.values()) {
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
        return msg.say(
          `You don't seem to have the role ${role}. Make sure you have it, then try again.`
        );
      }

      msg.member.roles.remove(userRole);

      return msg.say(
        `I've just revoked the role ${userRole.name.substring(
          1
        )}. If you'd like it back again, just ask!`
      );
    }

    return msg.say("Hmm... I can't understand that. Maybe try again?");
  }
}
