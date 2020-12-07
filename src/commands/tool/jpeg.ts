import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageAttachment } from "discord.js";
import { config, setupCommand } from "../../config";
import { isImageUrl, getImageUrl } from "../../util";
import got from "got";
import sharp from "sharp";

export default class JpegCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "jpeg",
        group: "tool",
        memberName: "jpeg",
        description: "More JPEG. 'nuff said",
        guildOnly: true,
        args: [
          {
            key: "target",
            prompt: "which image should I JPEGify?",
            type: "string",
            error: "say what?",
            default: "",
          },
        ],
      })
    );
  }

  async jpegify(image: Buffer): Promise<Buffer> {
    return await sharp(image)
      .resize(config.commands.jpeg.vars.resize)
      .gamma(config.commands.jpeg.vars.gamma)
      .jpeg({
        quality: config.commands.jpeg.vars.jpeg,
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
      let messages = msg.channel.messages.cache
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .array();
      let [lastMessage] = messages.slice(
        messages.length - 2,
        messages.length - 1
      );

      if (!lastMessage) {
        // If the bot was just started up, we have to fetch the messages since they aren't cached
        await msg.channel.messages.fetch();
        messages = msg.channel.messages.cache
          .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
          .array();
        [lastMessage] = messages.slice(
          messages.length - 2,
          messages.length - 1
        );

        if (!lastMessage) {
          return msg.say("Sorry, I can't find the last message :(");
        }
      }

      let imageUrl =
        lastMessage.attachments.first()?.url ??
        getImageUrl(lastMessage.content);

      if (!imageUrl) {
        return msg.say(
          "Hmm... There doesn't appear to be an image in the last message. Try specifying a message ID."
        );
      }

      if (!isImageUrl(imageUrl)) {
        return msg.say(
          "Wat. I can't seem to recognize that attachment as an image D:"
        );
      }

      const res = await got(imageUrl);
      const fileName = imageUrl.split(".").slice(-2).join(".");

      const processed = await this.jpegify(res.rawBody);

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);
    }

    // If target param is a URL
    if (isImageUrl(target)) {
      const res = await got(target);
      const fileName = target.split(".").slice(-2).join(".");

      const processed = await this.jpegify(res.rawBody);

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);

      // If target param is not a URL
    } else {
      let message = await msg.channel.messages
        .fetch(target)
        .catch(() => undefined);

      if (!message) {
        return msg.say("I couldn't find a message with that ID.");
      }

      const msgAttachment = message.attachments.first();

      if (!msgAttachment) {
        return msg.say("The specified message doesn't have any attachments.");
      }

      if (!isImageUrl(msgAttachment.url)) {
        return msg.say(
          "The specified message doesn't appear to have any JPEGifiable attachments."
        );
      }

      const imgBuffer = (await got(msgAttachment.url)).rawBody;
      const fileName = msgAttachment.url.split(".").slice(-2).join(".");

      const processed = await this.jpegify(imgBuffer);

      const attachment = new MessageAttachment(processed, fileName);

      return msg.say("", attachment);
    }
  }
}
