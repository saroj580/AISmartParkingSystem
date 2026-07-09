"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/** Clears the server session cookies and returns to the marketing site. */
export function useSignOut() {
  const router = useRouter();

  return useCallback(async () => {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }, [router]);
}
