import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/helpers/cookies";

export interface SessionUser {
  id: string;
  role: Role;
  email: string;
}

/** Reads and verifies the access token cookie for the current request. Returns null if absent/invalid. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    return { id: payload.sub, role: payload.role, email: payload.email };
  } catch {
    return null;
  }
}

const LOGIN_PATH_BY_ROLE: Record<Role, string> = {
  DRIVER: "/driver",
  OPERATOR: "/operator",
  ADMIN: "/admin",
};

/** Redirects to /login if unauthenticated, or to the user's own section if authenticated with the wrong role. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== role) {
    redirect(LOGIN_PATH_BY_ROLE[user.role]);
  }
  return user;
}
