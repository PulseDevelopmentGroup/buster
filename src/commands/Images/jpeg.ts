import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { AttachmentBuilder, type Message } from "discord.js";
import { Jimp } from "jimp";
import { config } from "../../lib/config";
import { getImageUrl, isImageURL } from "../../lib/utils";

@ApplyOptions<CommandOptions>(
  config.applyConfig("jpeg", {
    description: "More JPEG. 'nuff said",
  }),
)
export class JpegCommand extends Command {
  public override async messageRun(msg: Message, args: Args) {
    const target = !args.finished && (await args.rest("string"));
    const mentioned = msg.mentions?.users?.first();
    let imgUrl: string;

    if (!target) {
      ////
      //  If no target param exists
      ////
      const [lastMessage] = await msg.channel.messages.fetch({
        before: msg.id,
        limit: 1,
      });

      if (!lastMessage) {
        return send(msg, "Sorry, I can't find the last message :(");
      }

      const url =
        lastMessage[1].attachments.first()?.url ??
        getImageUrl(lastMessage[1].content);

      if (!url) {
        return send(
          msg,
          "Hmm... There doesn't appear to be an image in the last message. Try specifying a message ID.",
        );
      }

      if (!isImageURL(url)) {
        return send(
          msg,
          "Wat. I can't seem to recognize that attachment as an image D:",
        );
      }

      imgUrl = url;
    } else if (isImageURL(target)) {
      ////
      //  If target param is a URL
      ////
      imgUrl = target;
    } else if (mentioned) {
      ////
      //  If target param is a mention
      ////
      imgUrl = mentioned.displayAvatarURL().slice(0, -5);
    } else {
      ////
      //  If target param is not a URL
      ////
      const message = await msg.channel.messages
        .fetch(target)
        .catch(() => undefined);

      if (!message) {
        return send(msg, "I couldn't find a message with that ID.");
      }

      const msgAttachment = message.attachments.first();

      if (!msgAttachment) {
        return send(msg, "The specified message doesn't have any attachments.");
      }

      if (!isImageURL(msgAttachment.url)) {
        return send(
          msg,
          "The specified message doesn't appear to have any JPEGifiable attachments.",
        );
      }

      imgUrl = msgAttachment.url;
    }

    try {
      const jpegConfig = config.json.commands.jpeg;
      if (!jpegConfig) {
        return send(msg, "JPEG command configuration not found");
      }

      const attachment = await Jimp.read(imgUrl).then((i: any) => {
        return i
          .posterize(jpegConfig.vars.posterize as number)
          .getBufferAsync("image/jpeg")
          .then((b: Buffer) => {
            return b;
          });
      });

      return send(msg, {
        files: [new AttachmentBuilder(attachment, { name: "jpeg.jpg" })],
      });
    } catch (e) {
      msg.client.logger.error(e);
      return send(msg, "Unable to JPEGify the image D:");
    }
  }
}
