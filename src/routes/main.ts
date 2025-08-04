import type { PieceContext } from "@sapphire/framework";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  Route,
  type RouteOptions,
} from "@sapphire/plugin-api";

export class UserRoute extends Route {
  public constructor(context: PieceContext, options?: RouteOptions) {
    super(context, {
      ...options,
      route: "",
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: "Landing Page!" });
  }

  public [methods.POST](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: "Landing Page!" });
  }
}
