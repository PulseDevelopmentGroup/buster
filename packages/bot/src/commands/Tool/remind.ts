import { Args, Command, CommandOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import * as chrono from "chrono-node";
import type { Reminder } from "../../lib/models";

@ApplyOptions<CommandOptions>(
  config.applyConfig("remind", {
    description: "Remind me.. or you... or someone else",
    preconditions: ["NoThreads"],
    enabled: config.env.dbRedisHost != undefined,
  }),
)
export default class RemindCommand extends Command {
  async messageRun(msg: Message, args: Args) {
    const now = new Date();

    const payload: Reminder = {
      reminder: msg.author.id,
      remindee: await (await args.pick("extendedUser")).id,
      what: await args.pick("string").catch(() => ""),
      when: chrono.parseDate(await args.rest("string"), now, {
        forwardDate: true,
      }),
      where: msg.channel.id,
    };

    if (payload.when < now) {
      return msg.reply(
        "The date/time you asked to be reminded on is in the past.",
      );
    }

    this.container.tasks.create(
      "reminder",
      payload,
      payload.when.getTime() - now.getTime(),
    );

    const isToday = this.isToday(payload.when);

    return msg.reply(
      `Reminder set for ${payload.when.toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: isToday ? undefined : "full",
        timeStyle: "short",
      })}`,
    );
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getDate() == now.getDate() &&
      date.getMonth() == now.getMonth() &&
      date.getFullYear() == now.getFullYear()
    );
  }
}
