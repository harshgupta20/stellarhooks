import { type Network } from "@/lib/constants";

export const MODE_COOKIE = "sh_mode";

export type AppMode = "test" | "live";

export function modeToNetwork(mode: AppMode): Network {
  return mode === "live" ? "PUBLIC" : "TESTNET";
}

export function networkToMode(network: Network): AppMode {
  return network === "PUBLIC" ? "live" : "test";
}
