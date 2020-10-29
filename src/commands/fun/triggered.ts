import { MessageAttachment } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import got from "got/dist/source";
import sharp from "sharp";
import GifEncoder from "gifencoder";
import { Readable } from "stream";
import path from "path";

export default class TriggeredCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "triggered",
      group: "fun",
      memberName: "triggered",
      description: "Trigger people",
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage) {
    const scale = 20;
    let pfpUrl: string | undefined;
    const mentioned = msg.mentions?.users?.first();
    if (mentioned) {
      pfpUrl = mentioned.displayAvatarURL();
    } else {
      pfpUrl = msg.author.displayAvatarURL();
    }

    const pfp = (await got(pfpUrl)).rawBody;

    let basePfp = await sharp(pfp)
      .blur(2)
      .sharpen(3)
      .rotate(3)
      .gamma(1.2)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, 1, -1, -1, -1],
        scale: 250,
      });

    const imageMeta = await basePfp.metadata();

    const imageWidth = imageMeta.width ?? 128;

    const shiftedPfps: Buffer[] = [];

    for (let i = 0; i < 20; i++) {
      const offsetX = Math.floor(Math.random() * scale);
      const offsetY = Math.floor(Math.random() * scale);
      const offsetX2 = Math.floor((Math.random() * scale) / 3);
      const offsetY2 = Math.floor((Math.random() * scale) / 3);

      const overlay = await sharp(
        path.join(__dirname, "../../assets/triggered.png")
      )
        .png({
          quality: 1,
        })
        .blur(1.2)
        .extract({
          left: offsetX2,
          top: offsetY2,
          width: imageWidth - offsetX2 - Math.round(offsetX2 * Math.random()),
          height: imageWidth - offsetY2 - Math.round(offsetY2 * Math.random()),
        })
        .resize(128, 128)
        .toBuffer();

      let trimmedPfp = basePfp
        .clone()
        .extract({
          left: offsetX,
          top: offsetY,
          width: imageWidth - offsetX - Math.round(offsetX * Math.random()),
          height: imageWidth - offsetY - Math.round(offsetY * Math.random()),
        })
        .resize(128, 128)
        .composite([
          {
            input: overlay,
            gravity: "south",
          },
        ]);

      const buffer = await trimmedPfp.raw().toBuffer();

      shiftedPfps.push(buffer);
    }

    const encoder = new GifEncoder(imageWidth, imageWidth);

    shiftedPfps.forEach((shift) => {
      Readable.from(shift).pipe(
        encoder.createWriteStream({
          repeat: 0,
          delay: 100,
          quality: 1,
        })
      );
    });

    const chunks = [];
    for await (let chunk of encoder.createReadStream()) {
      chunks.push(chunk);
    }

    const out = Buffer.concat(chunks);

    const attachment = new MessageAttachment(
      out,
      `${msg.author.username}-triggered.gif`
    );

    return msg.say("", attachment);
  }
}
