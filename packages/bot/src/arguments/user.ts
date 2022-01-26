import type { PieceContext } from "@sapphire/pieces";
import type { User } from "discord.js";
import { Argument, Resolvers } from "@sapphire/framework";

// Based on code found here: https://github.com/sapphiredev/framework/blob/main/src/arguments/CoreUser.ts
// Since the name of this parser is "user" it will overwrite the existing user parser
export class UserArgument extends Argument<User> {
  public constructor(context: PieceContext) {
    super(context, { name: "user" });
  }

  public async run(
    parameter: string,
    context: Argument.Context,
  ): Argument.AsyncResult<User> {
    // If "me" is entered, return author as user
    if (parameter.toLowerCase() === "me")
      return this.ok(context.message.author);

    // Continue resolving normally
    const resolved = await Resolvers.resolveUser(parameter);
    if (resolved.success) return this.ok(resolved.value);

    return this.error({
      parameter,
      identifier: resolved.error,
      message: "The given argument did not resolve to a Discord user.",
      context,
    });
  }
}

declare module "@sapphire/framework" {
  interface ArgType {
    user: User;
  }
}
