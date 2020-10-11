import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { isImageUrl } from "../../util";
import got from "got";
import sharp from "sharp";
import { MessageAttachment } from "discord.js";

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
      const res = await got(target);
      const fileName = target.split(".").slice(-2).join(".");

      const processed = await sharp(res.rawBody)
        .jpeg({
          quality: 1,
        })
        .toBuffer();

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);
    } else {
      return msg.say("jpegify the message");
    }
  }
}
