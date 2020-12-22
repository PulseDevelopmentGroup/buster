import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import {
  isImageUrl,
  getImageUrl,
  getRandomBool,
  getRandomInt,
} from "../../util";
import { config, setupCommand } from "../../config";
import { MessageAttachment } from "discord.js";
import jimpConfig from "@jimp/custom";
import jimpPlugins from "@jimp/plugins";
import jimpTypes from "@jimp/types";
import jimpFisheye from "@jimp/plugin-fisheye";
import jimp from "jimp";
import path from "path";

// TODO: At this point, this custom config is not required.
// It would be nice to get the fisheye function working however, so I'm leaving it here.
const fryJimp = jimpConfig({
  types: [jimpTypes],
  plugins: [jimpPlugins, jimpFisheye],
});

export default class DeepfryCommand extends Command {
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
          "The specified message doesn't appear to have any fryable attachments."
        );
      }

      imgUrl = msgAttachment.url;
    }

    try {
      msg.channel.startTyping();

      const pixels = getRandomInt(3, 2);
      const useOkHand = getRandomBool(config.commands.fry.vars.okHandProb);
      const numHands = getRandomInt(config.commands.fry.vars.maxHands, 1);
      const useWearyFace = getRandomBool(
        config.commands.fry.vars.wearyFaceProb
      );

      let imgOkHand: jimp;
      if (useOkHand) {
        imgOkHand = await fryJimp.read(
          path.join(__dirname, "../../assets/ok-hand.png")
        );
      }

      let imgWearyFace: jimp;
      if (useWearyFace) {
        imgWearyFace = await fryJimp.read(
          path.join(__dirname, "../../assets/weary-face.png")
        );
      }

      return msg.say(
        "",
        new MessageAttachment(
          await fryJimp.read(imgUrl).then((i) => {
            if (useOkHand) {
              imgOkHand.scaleToFit(
                i.getWidth() * config.commands.fry.vars.superimposeScale,
                i.getHeight() * config.commands.fry.vars.superimposeScale
              );

              for (let q = 1; q <= numHands; q++) {
                this.superimpose(i, imgOkHand);
              }
            }

            if (useWearyFace) {
              imgWearyFace.scaleToFit(
                i.getWidth() * config.commands.fry.vars.superimposeScale,
                i.getHeight() * config.commands.fry.vars.superimposeScale
              );

              this.superimpose(i, imgWearyFace);
            }

            return i
              .pixelate(pixels)
              .posterize(config.commands.fry.vars.posterize)
              .contrast(config.commands.fry.vars.contrast)
              .color([
                {
                  apply: "mix",
                  params: ["#eb4034", config.commands.fry.vars.redMixOpacity],
                },
              ])
              .quality(config.commands.fry.vars.jpeg)
              .getBufferAsync(fryJimp.MIME_JPEG)
              .then((b) => {
                msg.channel.stopTyping();
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

  superimpose(baseImage: jimp, srcImage: jimp) {
    baseImage.blit(
      srcImage,
      getRandomInt(baseImage.getWidth() - srcImage.getWidth()),
      getRandomInt(baseImage.getHeight() - srcImage.getHeight())
    );
  }
}
