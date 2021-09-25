import { env, loadEnvironment } from "./lib/config";

try {
  loadEnvironment();
} catch (e) {
  console.error(e);
  process.exit(1);
}

// Initialize application dependencies
import "reflect-metadata";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands";

// Imports
import { options as coloretteOptions } from "colorette";
import { inspect } from "util";

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colored logs
coloretteOptions.enabled = env.development;
