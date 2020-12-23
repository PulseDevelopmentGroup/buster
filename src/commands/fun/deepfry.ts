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
import gm from "gm";

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
          return msg.say("Unable to find the last message :(");
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
          "I can't seem to recognize that attachment as an image D:"
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
      // This will take a while, so indicate the bot is working on it
      msg.channel.startTyping();

      // Define some constants for the level of pixelation, and use of emojis
      // All values are randomly generated
      const pixels = getRandomInt(3, 2);
      const useOkHand = getRandomBool(config.commands.fry.vars.okHandProb);
      const useWearyFace = getRandomBool(
        config.commands.fry.vars.wearyFaceProb
      );
      const useHundred = getRandomBool(config.commands.fry.vars.hundredProb);
      const useWater = getRandomBool(config.commands.fry.vars.waterProb);

      // Load images based on the random generation
      // TODO: Possible to load these a single time, rather than when the command is called, or is that a bad idea?
      // TODO: If that is a bad idea, maybe load them during the processing on lines 188-196ish? Is that possible?
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

      let imgHundred: jimp;
      if (useHundred) {
        imgHundred = await fryJimp.read(
          path.join(__dirname, "../../assets/hundred.png")
        );
      }

      let imgWater: jimp;
      if (useWater) {
        imgWater = await fryJimp.read(
          path.join(__dirname, "../../assets/sweat-droplets.png")
        );
      }

      // Start applying image effects
      const jimpOut = await fryJimp.read(imgUrl).then((i) => {
        i.pixelate(pixels)
          .posterize(config.commands.fry.vars.posterize)
          .contrast(config.commands.fry.vars.contrast)
          .color([
            {
              apply: "mix",
              params: ["#eb4034", config.commands.fry.vars.redMixOpacity],
            },
          ])
          .quality(config.commands.fry.vars.jpeg);

        // Add emojis
        if (useHundred) {
          imgHundred.scaleToFit(
            i.getWidth() * config.commands.fry.vars.superimposeScale,
            i.getHeight() * config.commands.fry.vars.superimposeScale
          );

          this.superimpose(i, imgHundred);
        }

        if (useWater) {
          imgWater.scaleToFit(
            i.getWidth() * config.commands.fry.vars.superimposeScale,
            i.getHeight() * config.commands.fry.vars.superimposeScale
          );

          this.superimpose(i, imgWater);
        }

        if (useOkHand) {
          imgOkHand.scaleToFit(
            i.getWidth() * config.commands.fry.vars.superimposeScale,
            i.getHeight() * config.commands.fry.vars.superimposeScale
          );

          // Randomly select number of ok_hand to place
          for (
            let q = 1;
            q <= getRandomInt(config.commands.fry.vars.maxHands, 1);
            q++
          ) {
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

        // Return buffer
        return i.getBufferAsync(fryJimp.MIME_JPEG).then((b) => {
          return b;
        });
      });

      // Generate noise and apply to image
      const out = await this.gmToBuffer(gm(jimpOut).noise("laplacian"));

      msg.channel.stopTyping();
      return msg.say("", new MessageAttachment(out));
    } catch (e) {
      console.error(e);
      return msg.say("Unable to fry the image D:");
    }
  }

  // Superimpose simply places an image at random coordinates (factoring in the size of the image being placed, I think..)
  superimpose(baseImage: jimp, srcImage: jimp) {
    baseImage.blit(
      srcImage,
      getRandomInt(baseImage.getWidth() - srcImage.getWidth()),
      getRandomInt(baseImage.getHeight() - srcImage.getHeight())
    );
  }

  gmToBuffer(data: gm.State) {
    return new Promise<Buffer>((resolve, reject) => {
      data.stream((err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const chunks: any = []; //TODO: Give this a type
        stdout.on("data", (chunk) => {
          chunks.push(chunk);
        });
        // these are 'once' because they can and do fire multiple times for multiple errors,
        // but this is a promise so you'll have to deal with them one at a time
        stdout.once("end", () => {
          resolve(Buffer.concat(chunks));
        });
        stderr.once("data", (data) => {
          reject(String(data));
        });
      });
    });
  }
}
