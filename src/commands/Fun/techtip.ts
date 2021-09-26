import { applyConfig } from "../../lib/config";
import faker from "faker";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import type { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";

@ApplyOptions(
  applyConfig("techtip", {
    name: "techtip",
    description: "How to computer",
    preconditions: ["GuildOnly"],
  }),
)
export default class SupCommand extends Command {
  async run(msg: Message) {
    return send(msg, faker.hacker.phrase());
  }
}