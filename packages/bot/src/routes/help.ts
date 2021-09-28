import type { PieceContext } from "@sapphire/framework";
import {
  ApiRequest,
  ApiResponse,
  methods,
  Route,
  RouteOptions,
} from "@sapphire/plugin-api";

export class HelpRoute extends Route {
  public constructor(context: PieceContext, options?: RouteOptions) {
    super(context, {
      ...options,
      route: "commands/help",
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
    const commands = this.container.stores.get("commands").reduce(
      (acc, command, key) => {
        command.name;
        acc.set(key, {
          description: command.description,
        });

        return acc;
      },
      new Map<
        string,
        {
          description: string;
        }
      >(),
    );

    response.json(Object.fromEntries(commands));
  }
}
