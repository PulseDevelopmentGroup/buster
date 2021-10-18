import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import {
  BinaryRegex,
  OctalRegex,
  HexRegex,
  BaseSixtyFourRegex,
} from "../../lib/constants";

const RegexArr = [BinaryRegex, OctalRegex, HexRegex, BaseSixtyFourRegex];

@ApplyOptions<CommandOptions>(
  config.applyConfig("decode", {
    description: "decode all the things",
  }),
)
export class UserCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const encoded = await args.rest("string");
    for (const reg of RegexArr) {
      if (reg.test(encoded)) {
        if (RegexArr.indexOf(reg) == 0) {
          try {
            let decoded = "";
            const BinCharacter = encoded.match(new RegExp(".{1,8}", "g")) ?? "";
            if (!BinCharacter || BinCharacter === []) throw new Error();
            for (const bin of BinCharacter) {
              decoded += String.fromCharCode(parseInt(bin, 2));
            }
            return send(message, `Binary: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else if (RegexArr.indexOf(reg) == 1) {
          try {
            let decoded = "";
            const OctalCharacter =
              encoded.match(new RegExp(".{1,3}", "g")) ?? "";
            if (!OctalCharacter || OctalCharacter === []) throw new Error();
            for (const octal of OctalCharacter) {
              decoded += String.fromCharCode(parseInt(`${octal}`, 8));
            }
            return send(message, `Octal: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else if (RegexArr.indexOf(reg) == 2) {
          try {
            let decoded = "";
            const HexCharacter = encoded.match(new RegExp(".{1,2}", "g")) ?? "";
            if (!HexCharacter || HexCharacter === []) throw new Error();
            for (const hex of HexCharacter) {
              decoded += String.fromCharCode(parseInt(`${hex}`, 16));
            }
            return send(message, `Hexadecimal: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else {
          try {
            const buffer = Buffer.from(encoded, "base64");
            const decoded = buffer.toString("ascii");
            return send(message, `Base64: ${decoded}`);
          } catch (error) {
            continue;
          }
        }
      }
    }
    return send(message, `Message could not be decoded...`);
  }
}
