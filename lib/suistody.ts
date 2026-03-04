import { initSuistody } from "@suistody/core";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID ?? "";
const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as
  | "testnet"
  | "devnet"
  | "mainnet";

let initialized = false;

export function ensureInit() {
  if (initialized) return;
  if (!PACKAGE_ID) {
    throw new Error(
      "NEXT_PUBLIC_PACKAGE_ID environment variable is required"
    );
  }
  initSuistody({ packageId: PACKAGE_ID, network: NETWORK });
  initialized = true;
}

export { PACKAGE_ID, NETWORK };
