import {
  isImageURL,
  getImageUrl,
  getRandomBool,
  getRandomInt,
} from "../../lib/utils";
import { Message, MessageAttachment } from "discord.js";
import jimpConfig from "@jimp/custom";
import jimpPlugins from "@jimp/plugins";
import jimpTypes from "@jimp/types";
import jimpFisheye from "@jimp/plugin-fisheye";
import type jimp from "jimp";
import path from "path";
import gm from "gm";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { config } from "../../lib/config";

// TODO: At this point, this custom config is not required.
// It would be nice to get the fisheye function working however, so I'm leaving it here.
const fryJimp = jimpConfig({
  types: [jimpTypes],
  plugins: [jimpPlugins, jimpFisheye],
});

@ApplyOptions<CommandOptions>(
  config.applyConfig("fry", {
    description: "Deepfry your friends",
    preconditions: ["GuildOnly"],
  }),
)
export class DeepfryCommand extends Command {
  async run(msg: Message, args: Args) {
    const mentioned = msg.mentions?.users?.first();
    const target = args.nextMaybe().value;
    let imgUrl: string | undefined;

    if (!target) {
      ////
      //  If no target param exists
      ////

      const [[, lastMessage] = []] = await msg.channel.messages.fetch({
        before: msg.id,
        limit: 1,
      });

      if (!lastMessage) {
        return send(msg, "Unable to find the last message :(");
      }

      const url =
        lastMessage.attachments.first()?.url ??
        getImageUrl(lastMessage.content);

      if (!url) {
        return send(
          msg,
          "Hmm... There doesn't appear to be an image in the last message. Try specifying a message ID.",
        );
      }

      if (!isImageURL(url)) {
        return send(
          msg,
          "I can't seem to recognize that attachment as an image D:",
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
          "The specified message doesn't appear to have any fryable attachments.",
        );
      }

      imgUrl = msgAttachment.url;
    }

    try {
      // This will take a while, so indicate the bot is working on it
      await msg.channel.sendTyping();

      // Define some constants for the level of pixelation, and use of emojis
      // All values are randomly generated
      const pixels = getRandomInt(3, 2);
      const useOkHand = getRandomBool(config.json.commands.fry.vars.okHandProb);
      const useWearyFace = getRandomBool(
        config.json.commands.fry.vars.wearyFaceProb,
      );
      const useHundred = getRandomBool(
        config.json.commands.fry.vars.hundredProb,
      );
      const useWater = getRandomBool(config.json.commands.fry.vars.waterProb);

      // Load images based on the random generation
      // TODO: Possible to load these a single time, rather than when the command is called, or is that a bad idea?
      // TODO: If that is a bad idea, maybe load them during the processing on lines 188-196ish? Is that possible?
      let imgOkHand: jimp;
      if (useOkHand) {
        imgOkHand = await fryJimp.read(
          path.join(__dirname, "../../assets/ok-hand.png"),
        );
      }

      let imgWearyFace: jimp;
      if (useWearyFace) {
        imgWearyFace = await fryJimp.read(
          path.join(__dirname, "../../assets/weary-face.png"),
        );
      }

      let imgHundred: jimp;
      if (useHundred) {
        imgHundred = await fryJimp.read(
          path.join(__dirname, "../../assets/hundred.png"),
        );
      }

      let imgWater: jimp;
      if (useWater) {
        imgWater = await fryJimp.read(
          path.join(__dirname, "../../assets/sweat-droplets.png"),
        );
      }

      // Start applying image effects
      const jimpOut = await fryJimp.read(imgUrl).then((i) => {
        i.pixelate(pixels)
          .posterize(config.json.commands.fry.vars.posterize)
          .contrast(config.json.commands.fry.vars.contrast)
          .color([
            {
              apply: "mix",
              params: ["#eb4034", config.json.commands.fry.vars.redMixOpacity],
            },
          ])
          .quality(config.json.commands.fry.vars.jpeg);

        const superimposeScale = config.json.commands.fry.vars.superimposeScale;

        // Add emojis
        if (useHundred) {
          imgHundred.scaleToFit(
            i.getWidth() * superimposeScale,
            i.getHeight() * superimposeScale,
          );

          this.superimpose(i, imgHundred);
        }

        if (useWater) {
          imgWater.scaleToFit(
            i.getWidth() * superimposeScale,
            i.getHeight() * superimposeScale,
          );

          this.superimpose(i, imgWater);
        }

        if (useOkHand) {
          imgOkHand.scaleToFit(
            i.getWidth() * superimposeScale,
            i.getHeight() * superimposeScale,
          );

          // Randomly select number of ok_hand to place
          for (
            let q = 1;
            q <= getRandomInt(config.json.commands.fry.vars.maxHands, 1);
            q++
          ) {
            this.superimpose(i, imgOkHand);
          }
        }

        if (useWearyFace) {
          imgWearyFace.scaleToFit(
            i.getWidth() * superimposeScale,
            i.getHeight() * superimposeScale,
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

      if (out.length <= 0) {
        throw new Error(
          "Buffer is empty, this probably means the image could not be read or GraphicsMagick died.",
        );
      }

      return send(msg, {
        files: [new MessageAttachment(out, "fried.jpg")],
      });
    } catch (e) {
      console.error(e);
      return send(msg, `Unable to fry the image... "${e}"`);
    }
  }

  // Superimpose simply places an image at random coordinates (factoring in the size of the image being placed, I think..)
  superimpose(baseImage: jimp, srcImage: jimp) {
    baseImage.blit(
      srcImage,
      getRandomInt(baseImage.getWidth() - srcImage.getWidth()),
      getRandomInt(baseImage.getHeight() - srcImage.getHeight()),
    );
  }

  gmToBuffer(data: gm.State) {
    return new Promise<Buffer>((resolve, reject) => {
      data.stream((err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const chunks: any = []; //TODO: Give this the correct type
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
