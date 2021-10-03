import type { ListenerOptions, PieceContext } from "@sapphire/framework";
import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { config } from "../../lib/config";
import { NumberRegex, UnitRegex } from "../../lib/constants";

enum Measurement {
  length = "length", // meter
  volume = "volume", // liter
  mass = "mass", // gram
  time = "time", // second
  unknown = "unknown",
}

type Unit = {
  input: string;
  value: number;
  measurement: Measurement;
};

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

    // Get all units from the message
    let parsedUnit: Unit | null;
    const units: Unit[] = [];
    do {
      // Iterate through array and convert the regex result to a Unit
      parsedUnit = this.convert(UnitRegex.exec(message.content));
      if (parsedUnit) units.push(parsedUnit);
    } while (parsedUnit);

    // Build return message
    let result = "";
    for (const unit of units) {
      result += `\`${unit.input}\` is equal to \`${
        unit.value
      } ${this.measureToName(unit.measurement)}s\`\n`;
    }

    return message.reply(result);
  }

  // Convert measure to a readable string name
  private measureToName(measurement: Measurement): string {
    switch (measurement) {
      case Measurement.length:
        return "meter";
      case Measurement.volume:
        return "liter";
      case Measurement.mass:
        return "gram";
      case Measurement.time:
        return "second";
      case Measurement.unknown:
        return "unknown";
    }
  }

  // Convert regex input into a Unit
  private convert(unit: RegExpExecArray | null): Unit | null {
    if (!unit) return null;

    // Get the value and convert it
    let value: number = parseFloat(unit[1]);
    if (!value) return null;

    let measurement: Measurement;

    // WARNING: This is awful code, proceed with caution
    switch (unit[2].toLowerCase()) {
      // Length
      case "mm":
      case "milimeter":
      case "milimeters":
        measurement = Measurement.length;
        value /= 1000;
        break;
      case "cm":
      case "centimeter":
      case "centimeters":
        measurement = Measurement.length;
        value /= 100;
        break;
      case "m":
      case "meter":
      case "meters":
        measurement = Measurement.length;
        // Meter is our standard measure of length
        break;
      case "km":
      case "kilometer":
      case "kilometers":
        measurement = Measurement.length;
        value *= 1000;
        break;
      case '"':
      case "in":
      case "inch":
      case "inches":
        measurement = Measurement.length;
        value /= 39.37;
        break;
      case "'":
      case "ft":
      case "foot":
      case "feet":
        measurement = Measurement.length;
        value /= 3.281;
        break;
      case "yd":
      case "yard":
      case "yards":
        measurement = Measurement.length;
        value /= 1.094;
        break;
      case "mi":
      case "mile":
      case "miles":
        measurement = Measurement.length;
        value *= 1609;
        break;
      // Volume
      case "ml":
      case "milliliter":
        measurement = Measurement.length;
        value /= 1000;
        break;
      case "l":
      case "liter":
        measurement = Measurement.length;
        // Liter is our standard measure of volume
        break;
      case "cup":
      case "cups":
        measurement = Measurement.volume;
        value /= 4.227;
        break;
      case "pt":
      case "pint":
      case "pints":
        measurement = Measurement.volume;
        value /= 2.113;
        break;
      case "qt":
      case "quart":
      case "quarts":
        measurement = Measurement.volume;
        value /= 1.057;
        break;
      case "gal":
      case "gallon":
      case "gallons":
        measurement = Measurement.volume;
        value *= 3.785;
        break;
      // Mass
      case "mg":
      case "milligram":
      case "milligrams":
        measurement = Measurement.mass;
        value /= 1000;
        break;
      case "g":
      case "gram":
      case "grams":
        measurement = Measurement.mass;
        // Gram is our standard measure of mass/weight
        break;
      case "kg":
      case "kilogram":
      case "kilograms":
        measurement = Measurement.mass;
        value *= 100;
        break;
      // Weight
      case "oz":
      case "ounce":
      case "ounces":
        measurement = Measurement.mass;
        value *= 28.35;
        break;
      case "lb":
      case "pound":
      case "pounds":
        measurement = Measurement.mass;
        value *= 454;
        break;
      // Time
      case "ms":
      case "millisecond":
      case "milliseconds":
        measurement = Measurement.time;
        value /= 1000;
        break;
      case "s":
      case "second":
      case "seconds":
        measurement = Measurement.time;
        // Second is our standard measure of time
        break;
      case "min":
      case "minute":
      case "minutes":
        measurement = Measurement.time;
        value *= 60;
        break;
      case "hr":
      case "hour":
      case "hours":
        measurement = Measurement.time;
        value *= 3600;
        break;
      case "day":
      case "days":
        measurement = Measurement.time;
        value *= 86400;
        break;
      case "week":
      case "weeks":
        measurement = Measurement.time;
        value *= 604800;
        break;
      case "month":
      case "months":
        measurement = Measurement.time;
        value *= 2.628e6;
        break;
      case "year":
      case "years":
        measurement = Measurement.time;
        value *= 3.154e7;
        break;
      default:
        measurement = Measurement.unknown;
        value = 0;
    }

    if (measurement == Measurement.unknown) return null;

    return {
      input: unit[0].trim(),
      measurement,
      value,
    };
  }

  // Only enable if logCommands is true or we are in a dev enviornment
  public onLoad() {
    this.enabled = config.json.listeners[this.name].enabled;
    return super.onLoad();
  }
}
