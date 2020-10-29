import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import faker from "faker";

export default class SupCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "techtip",
      memberName: "techtip",
      group: "fun",
      aliases: ["sup"],
      description: "How to computer",
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage) {
    return msg.say(faker.hacker.phrase());
  }
}
