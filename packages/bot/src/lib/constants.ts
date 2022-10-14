import type { CommandOptions } from "@sapphire/framework";
import { Measurement, StandardUnit } from "./models";

export const IfunnyURLRegex =
  /https:\/\/(?:www\.)?ifunny\.co\/(picture|video)\/(\w*){9}/gim;

export const ImageURLRegex =
  /https?:\/\/\S*?\.(?:png|jpe?g)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?/im;

export const NumberRegex = /\d+/;

export const UnitRegex =
  /((?:\d|\.)+) ?((?:milli|m|centi|c|kilo|k)?(?:meter|m|gram|g|liter|l|inche|inch|in|"|feet|foot|ft|'|yard|yd|mile|mi|cup|pint|pt|quart|qt|gallon|gal|ounce|oz|pound|lb|second|sec|s|minute|min|hour|hr|day|week|month|year)s?)(?:\W|$)/gim;

export const BaseSixtyFourRegex = /^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$/;
export const HexRegex = /^[a-f0-9]+$/;
export const OctalRegex = /^[0-7]+$/;
export const BinaryRegex = /^[01]+$/;

// See https://sapphiredev.github.io/framework/interfaces/CommandOptions.html for more info
export const CommandOptionsFields = [
  "aliases",
  "cooldownDelay",
  "cooldownFilteredUsers",
  "cooldownLimit",
  "cooldownScope",
  "description",
  "detailedDescription",
  "enabled",
  "flags",
  "fullCategory",
  "generateDashLessAliases",
  "name",
  "nsfw",
  "options",
  "preconditions",
  "prefixes",
  "quotes",
  "requiredClientPermissions",
  "requiredUserPermissions",
  "runIn",
  "separators",
  "typing",
] as (keyof CommandOptions)[];

export const TENOR_URL = new URL("https://api.tenor.com/v1/random");

export const INSPIRE_URL = new URL("http://inspirobot.me/api");

export const PERSPECTIVE_URL = new URL(
  "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1",
);

export const EMBED_COLOR = "#DBC12F";

/* Useless Conversions */

export const StandardMeasurements: Record<Measurement, StandardUnit[]> = {
  length: [
    {
      name: "hotdogs",
      measurement: Measurement.length,
      value: 0.12192,
    },
    {
      name: "male hands",
      measurement: Measurement.length,
      value: 0.21844,
    },
    {
      name: "female hands",
      measurement: Measurement.length,
      value: 0.17272,
    },
    {
      name: "female hands",
      measurement: Measurement.length,
      value: 0.17272,
    },
    {
      name: "furlongs",
      measurement: Measurement.length,
      value: 201.168,
    },
    {
      name: "parsecs",
      measurement: Measurement.length,
      value: 3.086e16,
    },
    {
      name: "cubits",
      measurement: Measurement.length,
      value: 0.444246,
    },
    {
      name: "football fields",
      measurement: Measurement.length,
      value: 91.44,
    },
    {
      name: "smoots",
      measurement: Measurement.length,
      value: 1.7018,
    },
    {
      name: "plancks",
      measurement: Measurement.length,
      value: 1.6e-35,
    },
    {
      name: "light years",
      measurement: Measurement.length,
      value: 9.461e15,
    },
    {
      name: "astronomical units",
      measurement: Measurement.length,
      value: 1.496e11,
    },
    {
      name: "2010 Honda Civic Coupes",
      measurement: Measurement.length,
      value: 4.4577,
    },
    {
      name: "iPhone 8's",
      measurement: Measurement.length,
      value: 0.1384,
    },
    {
      name: "average people",
      measurement: Measurement.length,
      value: 1.79832,
    },
    {
      name: "Capuchin Monkeys",
      measurement: Measurement.length,
      value: 0.381,
    },
    {
      name: "Rainlin Chubby Blob Seal Stuffed Cotton Plush Animal Toy Cute Oceans",
      measurement: Measurement.length,
      value: 0.59944,
    },
    {
      name: "AirPods",
      measurement: Measurement.length,
      value: 0.0405,
    },
    {
      name: "#2 Pencils",
      measurement: Measurement.length,
      value: 0.19,
    },
    {
      name: "Gucci GG belt buckles",
      measurement: Measurement.length,
      value: 0.059944,
    },
    {
      name: "Beard Seconds",
      measurement: Measurement.length,
      value: 1e-8,
    },
    {
      name: "Sheppys",
      measurement: Measurement.length,
      value: 1400,
    },
    {
      name: "Barleycorns",
      measurement: Measurement.length,
      value: 0.00847,
    },
    {
      name: "ur mom's waistline",
      measurement: Measurement.length,
      value: 3.048,
    },
  ],
  mass: [
    {
      name: "Troy Ounces",
      measurement: Measurement.mass,
      value: 31.1035,
    },
    {
      name: "Grains",
      measurement: Measurement.mass,
      value: 0.0647989,
    },
    {
      name: "Drams",
      measurement: Measurement.mass,
      value: 1.77185,
    },
    {
      name: "Pennyweights",
      measurement: Measurement.mass,
      value: 1.55517,
    },
    {
      name: "Electron Volts",
      measurement: Measurement.mass,
      value: 1.782662e-33,
    },
    {
      name: "1lb bags of coffee",
      measurement: Measurement.mass,
      value: 453.592,
    },
    {
      name: "ur moms",
      measurement: Measurement.mass,
      value: 45359237,
    },
    {
      name: "ants",
      measurement: Measurement.mass,
      value: 0.01,
    },
    {
      name: "ants",
      measurement: Measurement.mass,
      value: 0.01,
    },
    {
      name: "your failures",
      measurement: Measurement.mass,
      value: 907184.7,
    },
  ],
  time: [
    {
      name: "Dan minutes",
      measurement: Measurement.time,
      value: 300,
    },
    {
      name: "fortnights",
      measurement: Measurement.time,
      value: 1.21e6,
    },
    {
      name: "jiffys",
      measurement: Measurement.time,
      value: 0.01,
    },
  ],
  volume: [
    {
      name: "coombs",
      measurement: Measurement.volume,
      value: 145.47488,
    },
    {
      name: "drops",
      measurement: Measurement.volume,
      value: 5e-5,
    },
    {
      name: "shots",
      measurement: Measurement.volume,
      value: 0.0443603,
    },
    {
      name: "oil barrels",
      measurement: Measurement.volume,
      value: 158.987,
    },
    {
      name: "Mtn Dew Rise cans",
      measurement: Measurement.volume,
      value: 0.473,
    },
  ],
  unknown: [],
};
