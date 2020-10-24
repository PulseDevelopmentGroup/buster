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
      aliases: ["jpg"],
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

  async jpegify(image: Buffer): Promise<Buffer> {
    return await sharp(image)
      .jpeg({
        quality: 1,
      })
      .toBuffer();
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
      const messages = msg.channel.messages.cache.array();
      const [lastMessage] = messages.slice(
        messages.length - 2,
        messages.length - 1
      );

      const attachmentUrl = lastMessage.attachments.first()?.url;

      if (!attachmentUrl) {
        return msg.say(
          "Hmm... There doesn't appear to be an image in the last message. Try specifying a message ID."
        );
      }

      if (!isImageUrl(attachmentUrl)) {
        return msg.say(
          "Wat. I can't seem to recognize that attachment as an image :3"
        );
      }

      const res = await got(attachmentUrl);
      const fileName = attachmentUrl.split(".").slice(-2).join(".");

      const processed = await this.jpegify(res.rawBody);

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);
    }

    if (isImageUrl(target)) {
      const res = await got(target);
      const fileName = target.split(".").slice(-2).join(".");

      const processed = await this.jpegify(res.rawBody);

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);
    } else {
      return msg.say("jpegify the message");
    }
  }
}
