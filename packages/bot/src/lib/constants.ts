import type { CommandOptions } from "@sapphire/framework";

export const IfunnyURLRegex =
  /https:\/\/(?:www\.)?ifunny\.co\/(picture|video)\/(\w*){9}/gim;

export const ImageURLRegex =
  /https?:\/\/\S*?\.(?:png|jpe?g)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?/gim;

export const NumberRegex = /\d+/;

export const UnitRegex =
  /((?:\d|\.)+) ?((?:milli|m|centi|c|kilo|k)?(?:meter|m|gram|g|liter|l|inche|inch|in|"|feet|foot|ft|'|yard|yd|mile|mi|cup|pint|pt|quart|qt|gallon|gal|ounce|oz|pound|lb|second|s|minute|min|hour|hr|day|week|month|year)s?)(?:\W|$)/gim;

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

export const TENOR_URL = "https://api.tenor.com/v1/random";

export const INSPIRE_URL = "http://inspirobot.me/api";

export const PERSPECTIVE_URL =
  "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

export const EMBED_COLOR = "#DBC12F";
