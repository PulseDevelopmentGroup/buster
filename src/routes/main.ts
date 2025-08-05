import { type ApiRequest, type ApiResponse, Route } from "@sapphire/plugin-api";

export class UserRoute extends Route {
  public constructor(context: Route.LoaderContext) {
    super(context, {
      route: "",
    });
  }

  public override async run(
    _request: ApiRequest,
    response: ApiResponse,
  ): Promise<void> {
    response.json({ message: "Landing Page!" });
  }
}
