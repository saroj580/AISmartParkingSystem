import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export type RouteParams = Record<string, string | string[]>;

export interface RouteContext<P extends RouteParams = RouteParams> {
  params: Promise<P>;
}

export interface AuthedRouteContext<P extends RouteParams = RouteParams> extends RouteContext<P> {
  user: AuthUser;
}

export type RouteHandler<P extends RouteParams = RouteParams> = (
  req: NextRequest,
  ctx: RouteContext<P>
) => Promise<Response>;

export type AuthedRouteHandler<P extends RouteParams = RouteParams> = (
  req: NextRequest,
  ctx: AuthedRouteContext<P>
) => Promise<Response>;
