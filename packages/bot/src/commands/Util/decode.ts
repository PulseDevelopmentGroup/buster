import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import {
  binary_reg,
  octal_reg,
  hex_reg,
  base64_reg,
} from "../../lib/constants";

const reg_arr = [binary_reg, octal_reg, hex_reg, base64_reg];

@ApplyOptions<CommandOptions>({
  description: "decode all the things",
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const encoded = await args.rest("string");
    for (const reg of reg_arr) {
      if (reg.test(encoded)) {
        if (reg_arr.indexOf(reg) == 0) {
          try {
            let decoded = "";
            const bin_char = encoded.match(new RegExp(".{1,8}", "g")) ?? "";
            if (!bin_char || bin_char === []) throw new Error();
            for (const bin of bin_char) {
              decoded += String.fromCharCode(parseInt(bin, 2));
            }
            return send(message, `Binary: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else if (reg_arr.indexOf(reg) == 1) {
          try {
            let decoded = "";
            const octal_char = encoded.match(new RegExp(".{1,3}", "g")) ?? "";
            if (!octal_char || octal_char === []) throw new Error();
            for (const octal of octal_char) {
              decoded += String.fromCharCode(parseInt(`${octal}`, 8));
            }
            return send(message, `Octal: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else if (reg_arr.indexOf(reg) == 2) {
          try {
            let decoded = "";
            const hex_char = encoded.match(new RegExp(".{1,2}", "g")) ?? "";
            if (!hex_char || hex_char === []) throw new Error();
            for (const hex of hex_char) {
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
