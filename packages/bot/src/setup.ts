import { loadEnvironment } from "./lib/config";

try {
  loadEnvironment();
} catch (e) {
  console.error(e);
  process.exit(1);
}

// Initialize application dependencies
import "reflect-metadata";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands";

// Imports
import { inspect } from "util";

// Set default inspection depth
inspect.defaultOptions.depth = 1;