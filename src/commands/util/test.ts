import { Command } from "discord.js-commando";
import { setupCommand } from "../../config";

export default class TestCommand extends Command {
  constructor(client: any) {
    super(
      client,
      setupCommand({
        name: "test",
        group: "util",
        memberName: "test",
        description: "Testing things (obviously)",
        guildOnly: true,
        ownerOnly: true,
      })
    );
  }

  // TODO: Make these anys go away
  async run(msg: any, args: any) {
    console.log(msg);

    return msg.say("I LIVE!");
  }
}
