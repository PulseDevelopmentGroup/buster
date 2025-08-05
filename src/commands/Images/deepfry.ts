import path from "node:path";
import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { AttachmentBuilder, type Message } from "discord.js";
import gm from "gm";
import { Jimp } from "jimp";
import { config } from "../../lib/config";
import { logger } from "../../lib/logger";
import {
  getImageUrl,
  getRandomBool,
  getRandomInt,
  isImageURL,
} from "../../lib/utils";

// Using the standard Jimp instance with all built-in plugins

@ApplyOptions<CommandOptions>(
  config.applyConfig("fry", {
    description: "Deepfry your friends",
    preconditions: ["GuildOnly"],
  }),
)
export class DeepfryCommand extends Command {
  override async messageRun(msg: Message, args: Args) {
    const mentioned = msg.mentions?.users?.first();
    const target = args.next();
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
        return send(msg, "Unable to fetch previous message.");
      }

      const url =
        lastMessage.attachments.first()?.url ??
        getImageUrl(lastMessage.content);

      if (!url) {
        return send(
          msg,
          "There doesn't appear to be an image in the last message. Try specifying a message ID.",
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
        return send(msg, `Unable to find message with the ID: \`${target}\`.`);
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
      if (msg.channel.isSendable()) {
        await msg.channel.sendTyping();
      }

      const fryConfig = config.json.commands.fry;
      if (!fryConfig) {
        return send(msg, "Fry command configuration not found");
      }

      // Define some constants for the level of pixelation, and use of emojis
      // All values are randomly generated
      const pixels = getRandomInt(3, 2);
      const useOkHand = getRandomBool(fryConfig.vars.okHandProb as number);
      const useWearyFace = getRandomBool(
        fryConfig.vars.wearyFaceProb as number,
      );
      const useHundred = getRandomBool(fryConfig.vars.hundredProb as number);
      const useWater = getRandomBool(fryConfig.vars.waterProb as number);

      // Load images based on the random generation
      // TODO: Possible to load these a single time, rather than when the command is called, or is that a bad idea?
      // TODO: If that is a bad idea, maybe load them during the processing on lines 188-196ish? Is that possible?
      let imgOkHand: any;
      if (useOkHand) {
        imgOkHand = await Jimp.read(
          path.join(__dirname, "../../assets/fry/ok-hand.png"),
        );
      }

      let imgWearyFace: any;
      if (useWearyFace) {
        imgWearyFace = await Jimp.read(
          path.join(__dirname, "../../assets/fry/weary-face.png"),
        );
      }

      let imgHundred: any;
      if (useHundred) {
        imgHundred = await Jimp.read(
          path.join(__dirname, "../../assets/fry/hundred.png"),
        );
      }

      let imgWater: any;
      if (useWater) {
        imgWater = await Jimp.read(
          path.join(__dirname, "../../assets/fry/sweat-droplets.png"),
        );
      }

      // Start applying image effects
      const jimpOut = await Jimp.read(imgUrl).then((i: any) => {
        i.pixelate(pixels)
          .posterize(fryConfig.vars.posterize as number)
          .contrast(fryConfig.vars.contrast as number)
          .color([
            {
              apply: "mix",
              params: [
                { r: 235, g: 64, b: 52 },
                fryConfig.vars.redMixOpacity as number,
              ],
            },
          ]);

        const superimposeScale = fryConfig.vars.superimposeScale as number;

        // Add emojis
        if (useHundred) {
          imgHundred.scaleToFit(
            i.width * superimposeScale,
            i.height * superimposeScale,
          );

          this.superimpose(i, imgHundred);
        }

        if (useWater) {
          imgWater.scaleToFit(
            i.width * superimposeScale,
            i.height * superimposeScale,
          );

          this.superimpose(i, imgWater);
        }

        if (useOkHand) {
          imgOkHand.scaleToFit(
            i.width * superimposeScale,
            i.height * superimposeScale,
          );

          // Randomly select number of ok_hand to place
          for (
            let q = 1;
            q <= getRandomInt(fryConfig.vars.maxHands as number, 1);
            q++
          ) {
            this.superimpose(i, imgOkHand);
          }
        }

        if (useWearyFace) {
          imgWearyFace.scaleToFit(
            i.width * superimposeScale,
            i.height * superimposeScale,
          );

          this.superimpose(i, imgWearyFace);
        }

        // Return buffer
        return i.getBufferAsync("image/jpeg").then((b: Buffer) => {
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
        files: [new AttachmentBuilder(out, { name: "fried.jpg" })],
      });
    } catch (e) {
      const error = `Unable to fry the image. \`${e}\``;
      logger.command.error(error);
      return send(msg, error);
    }
  }

  // Superimpose simply places an image at random coordinates (factoring in the size of the image being placed, I think..)
  superimpose(baseImage: any, srcImage: any) {
    baseImage.blit(
      srcImage,
      getRandomInt(baseImage.width - srcImage.width),
      getRandomInt(baseImage.height - srcImage.height),
    );
  }

  gmToBuffer(data: gm.State) {
    return new Promise<Buffer>((resolve, reject) => {
      data.stream((err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const chunks: Uint8Array[] = [];
        stdout.on("data", (chunk: Uint8Array) => {
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
