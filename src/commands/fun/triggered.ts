import { MessageAttachment } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import got from "got/dist/source";
import sharp from "sharp";
import GifEncoder from "gifencoder";
import { Readable } from "stream";

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
    const scale = 25;
    const pfpUrl = msg.author.displayAvatarURL();

    const pfp = (await got(pfpUrl)).rawBody;

    const basePfp = await sharp(pfp);

    const imageMeta = await basePfp.metadata();

    const imageWidth = imageMeta.width ?? 128;

    const shiftedPfps: Buffer[] = [];

    for (let i = 0; i < 10; i++) {
      const offsetX = Math.floor(Math.random() * scale);
      const offsetY = Math.floor(Math.random() * scale);

      let trimmedPfp = basePfp
        .clone()
        .extract({
          left: offsetX,
          top: offsetY,
          width: imageWidth - offsetX * 2,
          height: imageWidth - offsetY * 2,
        })
        .resize(128);

      if (i === 0) {
        trimmedPfp = trimmedPfp.joinChannel(
          Buffer.alloc(imageWidth * imageWidth, 255),
          {
            raw: { channels: 1, width: imageWidth, height: imageWidth },
          }
        );
      }

      const buffer = await trimmedPfp.raw().toBuffer();

      shiftedPfps.push(buffer);
    }

    const encoder = new GifEncoder(imageWidth, imageWidth);

    shiftedPfps.forEach((shift) => {
      Readable.from(shift).pipe(
        encoder.createWriteStream({
          repeat: 0,
          delay: 100,
          quality: 10,
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