import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { config } from "../../config";

export default class NoCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "no",
      group: "util",
      memberName: "no",
      aliases: ["bad", "nope"],
      description: "Remove the most recent bot message in this channel",
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage) {
    // If cache is empty, get messages
    if (msg.channel.messages.cache.size == 0) {
      await msg.channel.messages.fetch();
    }

    // Get the most recent bot message
    let botMessage = msg.channel.messages.cache
      .filter((m) => m.author === this.client.user)
      .last();

    // Pull the last user command trigger
    let author = msg.channel.messages.cache
      .filter((m) => m.content.startsWith(this.client.commandPrefix))
      .last()?.author;

    // Check who's calling the command (either the origional caller, or an owner)
    if (config.owners.includes(msg.author.id) || msg.author == author) {
      botMessage?.edit("_**Removed**_").catch(() => {
        return msg.say("Unable to remove the message");
      });
      msg.delete();
    } else {
      return msg.say("You don't have permission to do that.");
    }
    return null;
  }
}
