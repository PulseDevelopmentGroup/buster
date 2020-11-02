import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { setupCommand } from "../../config";
import faker from "faker";

export default class SupCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "techtip",
        memberName: "techtip",
        group: "fun",
        description: "How to computer",
        guildOnly: true,
      })
    );
  }

  async run(msg: CommandoMessage) {
    return msg.say(faker.hacker.phrase());
  }
}
