import { faker } from "@faker-js/faker";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { Message } from "discord.js";
import { config } from "../../lib/config";

@ApplyOptions(
  config.applyConfig("techtip", {
    name: "techtip",
    description: "How to computer",
    preconditions: ["GuildOnly"],
  }),
)
export default class SupCommand extends Command {
  override async messageRun(msg: Message) {
    return send(msg, faker.hacker.phrase());
  }
}
