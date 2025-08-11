import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApplicationCommandRegistry,
  type Args,
  Command,
  type CommandOptions,
} from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { config } from "../../lib/config";
import {
  BaseSixtyFourRegex,
  BinaryRegex,
  HexRegex,
  OctalRegex,
} from "../../lib/constants";
import { registerSlash } from "../../lib/registry";

const RegexArr = [BinaryRegex, OctalRegex, HexRegex, BaseSixtyFourRegex];

@ApplyOptions<CommandOptions>(
  config.applyConfig("decode", {
    description: "decode all the things",
  }),
)
export class DecodeCommand extends Command {
  private decodeEncoded(
    encoded: string,
  ): { label: string; value: string } | null {
    for (const reg of RegexArr) {
      if (!reg.test(encoded)) continue;
      const idx = RegexArr.indexOf(reg);
      try {
        if (idx === 0) {
          // Binary
          let decoded = "";
          const BinCharacter = encoded.match(/.{1,8}/g) ?? "";
          if (!BinCharacter) throw new Error();
          for (const bin of BinCharacter)
            decoded += String.fromCharCode(parseInt(bin, 2));
          return { label: "Binary", value: decoded };
        }
        if (idx === 1) {
          // Octal
          let decoded = "";
          const OctalCharacter = encoded.match(/.{1,3}/g) ?? "";
          if (!OctalCharacter) throw new Error();
          for (const octal of OctalCharacter)
            decoded += String.fromCharCode(parseInt(`${octal}`, 8));
          return { label: "Octal", value: decoded };
        }
        if (idx === 2) {
          // Hex
          let decoded = "";
          const HexCharacter = encoded.match(/.{1,2}/g) ?? "";
          if (!HexCharacter) throw new Error();
          for (const hex of HexCharacter)
            decoded += String.fromCharCode(parseInt(`${hex}`, 16));
          return { label: "Hexadecimal", value: decoded };
        }
        // Base64
        const buffer = Buffer.from(encoded, "base64");
        const decoded = buffer.toString("ascii");
        return { label: "Base64", value: decoded };
      } catch {
        // keep scanning other regexes
      }
    }
    return null;
  }

  public override async messageRun(message: Message, args: Args) {
    const encoded = await args.rest("string");
    const res = this.decodeEncoded(encoded);
    if (res) return send(message, `${res.label}: ${res.value}`);
    return send(message, "Message could not be decoded...");
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const encoded = interaction.options.getString("text", true);
    const res = this.decodeEncoded(encoded);
    if (res) return interaction.reply(`${res.label}: ${res.value}`);
    return interaction.reply("Message could not be decoded...");
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registerSlash(registry, (b) => {
      b.setName(this.name)
        .setDescription(this.description)
        .addStringOption((o) =>
          o.setName("text").setDescription("Encoded text").setRequired(true),
        );
      return b;
    });
  }
}
