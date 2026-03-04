/**
 * Compatibility shim: re-export @mysten/sui v2 APIs with v1 names.
 *
 * The core SDK (@suistody/core) was compiled against @mysten/sui v1.x
 * which exports SuiClient and getFullnodeUrl from "@mysten/sui/client".
 * In v2.x these moved to "@mysten/sui/jsonRpc" and were renamed.
 * Additionally, v2's SuiJsonRpcClient requires a `network` param in its
 * constructor, while v1's SuiClient only needed `url`.
 *
 * This module is aliased as "@mysten/sui/client" via tsconfig paths
 * so the core SDK's compiled dist code resolves here at bundle time.
 */
import {
  SuiJsonRpcClient,
  getJsonRpcFullnodeUrl,
} from "@mysten/sui/jsonRpc";

function inferNetwork(
  url: string
): "mainnet" | "testnet" | "devnet" | "localnet" {
  if (url.includes("mainnet")) return "mainnet";
  if (url.includes("testnet")) return "testnet";
  if (url.includes("devnet")) return "devnet";
  return "localnet";
}

/**
 * Drop-in replacement for v1's SuiClient.
 * Accepts v1-style `{ url }` and auto-infers `network`.
 */
export class SuiClient extends SuiJsonRpcClient {
  constructor(options: { url: string; network?: string }) {
    const network = options.network ?? inferNetwork(options.url);
    super({ url: options.url, network });
  }
}

export { getJsonRpcFullnodeUrl as getFullnodeUrl };
