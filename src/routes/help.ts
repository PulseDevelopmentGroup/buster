import { type ApiRequest, type ApiResponse, Route } from "@sapphire/plugin-api";

export class HelpRoute extends Route {
  public constructor(context: Route.LoaderContext) {
    super(context, {
      route: "commands/help",
    });
  }

  public override async run(
    request: ApiRequest,
    response: ApiResponse,
  ): Promise<void> {
    if (request.method !== "GET") {
      return response.status(405).json({ error: "Method not allowed" });
    }
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
