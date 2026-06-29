import "server-only";

import { cookies } from "next/headers";

import { MODE_COOKIE, modeToNetwork, type AppMode } from "@/lib/mode";
import { type Network } from "@/lib/constants";

/** Current dashboard mode from the cookie. Defaults to test. */
export async function getMode(): Promise<AppMode> {
  const store = await cookies();
  return store.get(MODE_COOKIE)?.value === "live" ? "live" : "test";
}

/** The Stellar network for the current dashboard mode. */
export async function getModeNetwork(): Promise<Network> {
  return modeToNetwork(await getMode());
}
