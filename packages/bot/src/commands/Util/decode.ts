import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";

const base64_reg = new RegExp("^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$");
const hex_reg = new RegExp("^[a-f0-9]+$");
const octal_reg = new RegExp("^[0-7]+$");
const binary_reg = new RegExp("^[01]+$");
const reg_arr = [binary_reg, octal_reg, hex_reg, base64_reg];

@ApplyOptions<CommandOptions>({
  description: "decode all the things",
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    let encoded = "";
    while (await args.nextMaybe().exists) {
      encoded += await args.nextMaybe().value;
    }
    for (const reg of reg_arr) {
      if (reg.test(encoded)) {
        if (reg_arr.indexOf(reg) == 0) {
          try {
            let decoded = "";
            const bin_char = encoded.match(new RegExp(".{1,8}", "g"));
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
            const octal_char = encoded.match(new RegExp(".{1,3}", "g"));
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
            const hex_char = encoded.match(new RegExp(".{1,2}", "g"));
            for (const hex of hex_char) {
              decoded += String.fromCharCode(parseInt(`${hex}`, 16));
            }
            return send(message, `Hexadecimal: ${decoded}`);
          } catch (error) {
            continue;
          }
        } else {
          try {
            const buffer = new Buffer(encoded, "base64");
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
