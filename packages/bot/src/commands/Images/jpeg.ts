import { MessageAttachment } from "discord.js";
import { isImageURL, getImageUrl } from "../../lib/utils";
import jimp from "jimp";
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { config } from "../../lib/config";
import { ApplicationCommandType } from "discord-api-types/v9";
import { isMessageInstance } from "@sapphire/discord.js-utilities";

@ApplyOptions<CommandOptions>(
  config.applyConfig("jpeg", {
    name: "JPEG",
    description: "More JPEG. 'nuff said",
  }),
)
export class JpegCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerContextMenuCommand((builder) =>
      builder.setName(this.name).setType(ApplicationCommandType.Message),
    );
  }

  public override async contextMenuRun(
    interaction: Command.ContextMenuInteraction,
  ) {
    if (
      interaction.isMessageContextMenu() &&
      isMessageInstance(interaction.targetMessage)
    ) {
      const msg = interaction.targetMessage;
      const mentioned = msg.mentions.users.first();
      let imgUrl: string;

      if (mentioned) {
        ////
        //  If target param is a mention
        ////
        imgUrl = mentioned.displayAvatarURL().slice(0, -5);
      } else {
        const url = msg.attachments.first()?.url ?? getImageUrl(msg.content);
        if (!url || !isImageURL(url)) {
          return interaction.reply(
            "The specified message doesn't appear to have any JPEGifiable attachments.",
          );
        }

        imgUrl = url;
      }

      try {
        const attachment = await jimp.read(imgUrl).then((i) => {
          return i
            .posterize(config.json.commands.jpeg.vars.posterize)
            .quality(config.json.commands.jpeg.vars.jpeg)
            .getBufferAsync(jimp.MIME_JPEG)
            .then((b) => {
              return b;
            });
        });

        return interaction.reply({
          files: [new MessageAttachment(attachment)],
        });
      } catch (e) {
        msg.client.logger.error(e);
        return interaction.reply({
          content: "Unable to JPEGify the image D:",
        });
      }
    }

    return;
  }
}
