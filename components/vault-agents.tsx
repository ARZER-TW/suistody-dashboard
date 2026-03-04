"use client";

import { useState } from "react";
import { buildCreateAgentCap, buildRevokeAgentCap } from "@suistody/core";
import { ensureInit } from "@/lib/suistody";
import { useSignExecute } from "@/hooks/use-sign-execute";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface VaultAgentsProps {
  vaultId: string;
  ownerCapId: string;
  authorizedCaps: string[];
}

export function VaultAgents({
  vaultId,
  ownerCapId,
  authorizedCaps,
}: VaultAgentsProps) {
  const account = useCurrentAccount();
  const [showForm, setShowForm] = useState(false);
  const [agentAddress, setAgentAddress] = useState("");
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const { execute, isPending, error, lastDigest } = useSignExecute({
    invalidateKeys: [
      ["vault", vaultId],
      ["vaults", account?.address ?? ""],
    ],
  });

  async function handleAuthorize(e: React.FormEvent) {
    e.preventDefault();
    if (!agentAddress) return;
    ensureInit();

    const tx = buildCreateAgentCap({
      vaultId,
      ownerCapId,
      agentAddress,
    });

    const digest = await execute(tx);
    if (digest) {
      setAgentAddress("");
      setShowForm(false);
    }
  }

  async function handleRevoke(capId: string) {
    ensureInit();

    const tx = buildRevokeAgentCap({
      vaultId,
      ownerCapId,
      capId,
    });

    const digest = await execute(tx);
    if (digest) {
      setRevokeConfirm(null);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Authorized Agents ({authorizedCaps.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1 rounded border border-blue-600 text-blue-400 hover:bg-blue-600/20 transition-colors"
        >
          {showForm ? "Cancel" : "Add Agent"}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 rounded p-2 mb-4">
          {error}
        </div>
      )}

      {lastDigest && (
        <div className="text-green-400 text-sm bg-green-500/10 rounded p-2 mb-4">
          Success! Tx: {lastDigest.slice(0, 16)}...
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAuthorize} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Agent address (0x...)"
            value={agentAddress}
            onChange={(e) => setAgentAddress(e.target.value)}
            pattern="0x[a-fA-F0-9]{64}"
            title="Valid Sui address (0x + 64 hex chars)"
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm font-mono"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 transition-colors"
          >
            {isPending ? "..." : "Authorize"}
          </button>
        </form>
      )}

      {authorizedCaps.length === 0 ? (
        <p className="text-gray-400 text-sm">No agents authorized.</p>
      ) : (
        <div className="space-y-2">
          {authorizedCaps.map((capId) => (
            <div
              key={capId}
              className="flex items-center justify-between py-2 border-b border-gray-800"
            >
              <span className="font-mono text-xs text-gray-400 truncate max-w-[300px]">
                {capId}
              </span>
              {revokeConfirm === capId ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRevoke(capId)}
                    disabled={isPending}
                    className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 disabled:bg-gray-700 transition-colors"
                  >
                    {isPending ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setRevokeConfirm(null)}
                    className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRevokeConfirm(capId)}
                  className="text-xs px-2 py-1 rounded border border-red-600 text-red-400 hover:bg-red-600/20 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
