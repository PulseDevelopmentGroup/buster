import { Command } from "discord.js-commando";

module.exports = class TestCommand extends Command {
  constructor(client: any) {
    super(client, {
      name: "test",
      group: "utils",
      memberName: "test",
      description: "Testing things (obviously)",
      guildOnly: true,
    });
  }

  // TODO: Make these anys go away
  async run(msg: any, args: any) {
    console.log(msg);

    return msg.say("I LIVE!");
  }
};
