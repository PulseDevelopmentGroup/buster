import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import * as chrono from "chrono-node";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import type { Reminder } from "../../lib/models";

// Configure the command to only work in regular text channels, if Redis is enabled.
@ApplyOptions<CommandOptions>(
  config.applyConfig("remind", {
    description: "Remind me.. or you... or someone else",
    preconditions: ["NoThreads"],
  }),
)
export default class RemindCommand extends Command {
  public override async messageRun(msg: Message, args: Args) {
    const now = new Date();

    /* Error handling! */
    const who = await args.pick("user").catch(() => undefined);
    if (!who) return msg.reply("You must specify who to remind.");

    const what = await args.pick("string").catch(() => undefined);
    if (!what) return msg.reply("You must specify what to remind.");

    const when = await args.rest("string");
    const whenDate = chrono.parseDate(when, now, { forwardDate: true });
    if (!whenDate) return msg.reply("You must specify when to remind.");

    /* Build payload and perform final checks */
    const payload: Reminder = {
      reminder: msg.author.id,
      who: who.id,
      what: what,
      when: whenDate,
      where: msg.channel.id,
    };

    if (payload.when < now) {
      return msg.reply(
        "The date/time you asked to be reminded on is in the past.",
      );
    }

    /* Create reminder and inform user */
    this.container.tasks.create(
      {
        name: "reminder",
        payload: payload,
      },
      payload.when.getTime() - now.getTime(),
    );

    return msg.reply(
      `Reminder set for ${payload.when.toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: this.isToday(payload.when) ? undefined : "full",
        timeStyle: "short",
      })}`,
    );
  }

  // Checks supplied date against current date to see if the day is the same
  isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
}
