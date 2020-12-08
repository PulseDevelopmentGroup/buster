import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageAttachment } from "discord.js";
import { config, setupCommand } from "../../config";
import { isImageUrl, getImageUrl } from "../../util";
import jimp from "jimp";
import got from "got";

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
    jimp.read(image).then((image) => {
      image
        .resize(config.commands.jpeg.vars.resize, jimp.AUTO)
        .dither565()
        .quality(config.commands.jpeg.vars.jpeg)
        .getBuffer(jimp.MIME_JPEG, (err, buf) => {
          if (err) {
            return Promise.reject(err);
          }
          return buf;
        });
    });
    return Promise.reject(new Error("Unable to read image"));
  }

  async run(
    msg: CommandoMessage,
    {
      target,
    }: {
      target: string;
    }
  ) {
    let rawImg: Buffer;
    let fileName: string;

    if (!target) {
      ////
      //  If no target param exists
      ////
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

      rawImg = (await got(imageUrl)).rawBody;
      fileName = imageUrl.split(".").slice(-2).join(".");
    } else if (isImageUrl(target)) {
      ////
      //  If target param is a URL
      ////
      rawImg = (await got(target)).rawBody;
      fileName = target.split(".").slice(-2).join(".");
    } else {
      ////
      //  If target param is not a URL
      ////
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

      rawImg = (await got(msgAttachment.url)).rawBody;
      fileName = msgAttachment.url.split(".").slice(-2).join(".");
    }

    try {
      return msg.say(
        "",
        new MessageAttachment(await this.jpegify(rawImg), fileName)
      );
    } catch (e) {
      console.log(e);
      return msg.say("Unable to process image :(");
    }
  }
}
