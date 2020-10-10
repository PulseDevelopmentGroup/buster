import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { isImageUrl } from "../../util";

export default class JpegCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "jpeg",
      group: "utils",
      memberName: "jpeg",
      description: "More JPEG. 'nuff said",
      guildOnly: true,

      args: [
        {
          key: "target",
          prompt: "Which image should I JPEGify?",
          type: "string",
          error: "Say what?",
          default: "",
        },
      ],
    });
  }

  async run(
    msg: CommandoMessage,
    {
      target,
    }: {
      target: string;
    }
  ) {
    if (!target) {
      return msg.say(`I'm supposed to jpegify the last image`);
    }

    if (isImageUrl(target)) {
      return msg.say("Jpegify the url");
    } else {
      return msg.say("jpegify the message");
    }
  }
}
