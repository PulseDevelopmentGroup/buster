import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import { NumberRegex, UnitRegex } from "../../lib/constants";

enum Measurements {
  meter = "meter",
  liter = "liter",
  gram = "gram",
  second = "second",
  unknown = "unknown",
}

export class UserEvent extends Listener<typeof Events.MessageCreate> {
  public constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  // Fires on every message sent by a user
  public async run(message: Message) {
    // Hopefully ignore as much as we can to reduce load on the bot
    if (
      message.author.bot ||
      message.content === "" ||
      !NumberRegex.test(message.content)
    )
      return;

    // Get the units from the message
    const units = UnitRegex.exec(message.content);

    console.log(units);

    // If the regex returned nothing, exit
    if (!units) return;

    // Get the value and convert it
    let value: number | null = parseFloat(units[1]);
    let measurement: Measurements;

    // WARNING: This is awful code, proceed with caution
    console.log(`${units[1]}, ${units[2]}`);
    switch (units[2].toLowerCase()) {
      // Length
      case "mm":
      case "milimeter":
      case "milimeters":
        measurement = Measurements.meter;
        value /= 1000;
        break;
      case "cm":
      case "centimeter":
      case "centimeters":
        measurement = Measurements.meter;
        value /= 100;
        break;
      case "m":
      case "meter":
      case "meters":
        measurement = Measurements.meter;
        // Meter is our standard measure of length
        break;
      case "km":
      case "kilometer":
      case "kilometers":
        measurement = Measurements.meter;
        value *= 1000;
        break;
      case '"':
      case "in":
      case "inch":
      case "inches":
        measurement = Measurements.meter;
        value /= 39.37;
        break;
      case "'":
      case "ft":
      case "foot":
      case "feet":
        measurement = Measurements.meter;
        value /= 3.281;
        break;
      case "yd":
      case "yard":
      case "yards":
        measurement = Measurements.meter;
        value /= 1.094;
        break;
      case "mi":
      case "mile":
      case "miles":
        measurement = Measurements.meter;
        value *= 1609;
        break;
      // Volume
      case "ml":
      case "milliliter":
        measurement = Measurements.liter;
        value /= 1000;
        break;
      case "l":
      case "liter":
        measurement = Measurements.liter;
        // Liter is our standard measure of volume
        break;
      case "cup":
      case "cups":
        measurement = Measurements.liter;
        value /= 4.227;
        break;
      case "pt":
      case "pint":
      case "pints":
        measurement = Measurements.liter;
        value /= 2.113;
        break;
      case "qt":
      case "quart":
      case "quarts":
        measurement = Measurements.liter;
        value /= 1.057;
        break;
      case "gal":
      case "gallon":
      case "gallons":
        measurement = Measurements.liter;
        value *= 3.785;
        break;
      // Mass
      case "mg":
      case "milligram":
      case "milligrams":
        measurement = Measurements.gram;
        value /= 1000;
        break;
      case "g":
      case "gram":
      case "grams":
        measurement = Measurements.gram;
        // Gram is our standard measure of mass/weight
        break;
      case "kg":
      case "kilogram":
      case "kilograms":
        measurement = Measurements.gram;
        value *= 100;
        break;
      // Weight
      case "oz":
      case "ounce":
      case "ounces":
        measurement = Measurements.gram;
        value *= 28.35;
        break;
      case "lb":
      case "pound":
      case "pounds":
        measurement = Measurements.gram;
        value *= 454;
        break;
      // Time
      case "ms":
      case "millisecond":
      case "milliseconds":
        measurement = Measurements.second;
        value /= 1000;
        break;
      case "s":
      case "second":
      case "seconds":
        measurement = Measurements.second;
        // Second is our standard measure of time
        break;
      case "min":
      case "minute":
      case "minutes":
        measurement = Measurements.second;
        value *= 60;
        break;
      case "hr":
      case "hour":
      case "hours":
        measurement = Measurements.second;
        value *= 3600;
        break;
      case "day":
      case "days":
        measurement = Measurements.second;
        value *= 86400;
        break;
      case "week":
      case "weeks":
        measurement = Measurements.second;
        value *= 604800;
        break;
      case "month":
      case "months":
        measurement = Measurements.second;
        value *= 2.628e6;
        break;
      case "year":
      case "years":
        measurement = Measurements.second;
        value *= 3.154e7;
        break;
      default:
        measurement = Measurements.unknown;
        value = null;
    }

    if (measurement == Measurements.unknown) return;

    return message.reply(
      `${units[0]} is equal to ${value} ${measurement.toString()}s`
    );
  }

  // Only enable if logCommands is true or we are in a dev enviornment
  public onLoad() {
    this.enabled = config.json.listeners.includes(this.name);
    return super.onLoad();
  }
}
