import { MessageEmbed, Role } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class RoleCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "role",
      group: "utils",
      aliases: ["g", "gib"],
      memberName: "role",
      description: "Get, give, and remove roles & permissions",
      guildOnly: true,

      args: [
        {
          key: "action",
          prompt: "(g)ive or (t)ake a role?",
          type: "string",
          oneOf: ["g", "give", "gib", "t", "take"],
          error: "Hmm... I couldn't understand that :(",
          default: "",
        },
        {
          key: "role",
          prompt: "what role would you like to edit?",
          type: "string",
          default: "",
        },
      ],
    });
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

    if (["g", "give", "gib"].includes(action)) {
      return msg.say("I should give you a role");
    }

    if (["t", "take"].includes(action)) {
      return msg.say("Ima bout to revoke a role");
    }

    return msg.say("wat?");
  }
}
