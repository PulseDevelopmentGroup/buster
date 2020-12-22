import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageAttachment } from "discord.js";
import { config, setupCommand } from "../../config";
import { isImageUrl, getImageUrl } from "../../util";
import jimp from "jimp";

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

  async run(
    msg: CommandoMessage,
    {
      target,
    }: {
      target: string;
    }
  ) {
    const mentioned = msg.mentions?.users?.first();
    let imgUrl: string;

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

      let url =
        lastMessage.attachments.first()?.url ??
        getImageUrl(lastMessage.content);

      if (!url) {
        return msg.say(
          "Hmm... There doesn't appear to be an image in the last message. Try specifying a message ID."
        );
      }

      if (!isImageUrl(url)) {
        return msg.say(
          "Wat. I can't seem to recognize that attachment as an image D:"
        );
      }

      imgUrl = url;
    } else if (isImageUrl(target)) {
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

      imgUrl = msgAttachment.url;
    }

    try {
      return msg.say(
        "",
        new MessageAttachment(
          await jimp.read(imgUrl).then((i) => {
            return i
              .posterize(config.commands.jpeg.vars.posterize)
              .quality(config.commands.jpeg.vars.jpeg)
              .getBufferAsync(jimp.MIME_JPEG)
              .then((b) => {
                return b;
              });
          })
        )
      );
    } catch (e) {
      console.error(e);
      return msg.say("Unable to JPEGify the image D:");
    }
  }
}
