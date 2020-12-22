import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { isImageUrl, getImageUrl } from "../../util";
import { config, setupCommand } from "../../config";
import { MessageAttachment } from "discord.js";
import jimp from "jimp";

export default class TriggeredCommand extends Command {
  constructor(client: CommandoClient) {
    super(
      client,
      setupCommand({
        name: "fry",
        group: "fun",
        memberName: "fry",
        description: "Deepfry your friends",
        guildOnly: true,
        args: [
          {
            key: "target",
            prompt: "What is getting fried?",
            type: "string",
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
    let imgUrl: string | undefined;
    /*
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
      imgUrl = mentioned.displayAvatarURL();
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
          "The specified message doesn't appear to have any fryable attachments."
        );
      }

      imgUrl = msgAttachment.url;
    }*/

    try {
      return msg.say(
        "",
        new MessageAttachment(
          await jimp
            .read(
              "https://images.unsplash.com/photo-1606126210582-3a17753188b9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=raja-sen-FrjdQhKSWb0-unsplash.jpg&w=1920"
            )
            .then((i) => {
              return i
                .quality(config.commands.fry.vars.jpeg)
                .posterize(50)
                .contrast(1)
                .brightness(-0.1)
                .color([{ apply: "saturate" as any, params: [100] }])
                .getBufferAsync(jimp.MIME_JPEG)
                .then((b) => {
                  return b;
                });
            })
        )
      );
    } catch (e) {
      console.error(e);
      return msg.say("Unable to fry the image D:");
    }
  }
}
