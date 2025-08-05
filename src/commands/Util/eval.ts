import { inspect } from "node:util";
import { ApplyOptions } from "@sapphire/decorators";
import { type Args, Command, type CommandOptions } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { codeBlock, isThenable } from "@sapphire/utilities";
import type { Message } from "discord.js";

/**
 * Simple type detection function to replace @sapphire/type functionality
 * Returns a TypeScript-like type string for the given value
 */
function getType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const primitiveType = typeof value;

  // Handle primitive types
  if (primitiveType !== "object" && primitiveType !== "function") {
    return primitiveType;
  }

  // Handle functions
  if (primitiveType === "function") {
    return "Function";
  }

  // Handle objects - use Object.prototype.toString for accurate type detection
  const objectType = Object.prototype.toString.call(value);
  const match = objectType.match(/^\[object (\w+)\]$/);

  if (match?.[1]) {
    const typeName = match[1];

    // Handle arrays with generic type notation
    if (typeName === "Array") {
      const arr = value as unknown[];
      if (arr.length === 0) {
        return "Array<unknown>";
      }

      // Get the type of the first element as a simple approximation
      const firstElementType = getType(arr[0]);
      return `Array<${firstElementType}>`;
    }

    return typeName;
  }

  return "object";
}

@ApplyOptions<CommandOptions>({
  aliases: ["ev"],
  description: "Evals any JavaScript code",
  quotes: [],
  preconditions: ["OwnerOnly"],
  flags: ["async", "hidden", "showHidden", "silent", "s"],
  options: ["depth"],
})
export class EvalCommand extends Command {
  public override async messageRun(message: Message, args: Args) {
    const code = await args.rest("string");

    const { result, success, type } = await this.eval(message, code, {
      async: args.getFlags("async"),
      depth: Number(args.getOption("depth")) ?? 0,
      showHidden: args.getFlags("hidden", "showHidden"),
    });

    const output = success
      ? codeBlock("js", result)
      : `**ERROR**: ${codeBlock("bash", result)}`;
    if (args.getFlags("silent", "s")) return null;

    const typeFooter = `**Type**: ${codeBlock("typescript", type)}`;

    if (output.length > 2000) {
      return send(message, {
        content: `Output was too long... sent the result as a file.\n\n${typeFooter}`,
        files: [{ attachment: Buffer.from(output), name: "output.js" }],
      });
    }

    return send(message, `${output}\n${typeFooter}`);
  }

  private async eval(
    _message: Message,
    code: string,
    flags: { async: boolean; depth: number; showHidden: boolean },
  ) {
    if (flags.async) code = `(async () => {\n${code}\n})();`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const msg = message; // Unused variable removed

    let success = true;
    let result = null;

    try {
      // eslint-disable-next-line no-eval
      result = eval(code);
    } catch (error) {
      if (error && error instanceof Error && error.stack) {
        this.container.client.logger.error(error);
      }
      result = error;
      success = false;
    }

    const type = getType(result);
    if (isThenable(result)) result = await result;

    if (typeof result !== "string") {
      result = inspect(result, {
        depth: flags.depth,
        showHidden: flags.showHidden,
      });
    }

    return { result, success, type };
  }
}
