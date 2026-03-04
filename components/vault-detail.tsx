"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getVault,
  getVaultEvents,
  getOwnerCaps,
} from "@suistody/core";
import { ensureInit } from "@/lib/suistody";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VaultActions } from "./vault-actions";
import { VaultPolicyForm } from "./vault-policy-form";
import { VaultAgents } from "./vault-agents";

const STATUS_LABELS: Record<number, string> = {
  0: "Active",
  1: "Paused",
  2: "Locked",
};

const ACTION_LABELS: Record<number, string> = {
  0: "Swap",
  1: "Stable Mint",
  2: "Stable Burn",
  3: "Stable Claim",
};

export function VaultDetail({ vaultId }: { vaultId: string }) {
  const account = useCurrentAccount();
  const [showPolicyForm, setShowPolicyForm] = useState(false);

  const {
    data: vault,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vault", vaultId],
    queryFn: async () => {
      ensureInit();
      return getVault(vaultId);
    },
  });

  const { data: events } = useQuery({
    queryKey: ["vault-events", vaultId],
    queryFn: async () => {
      ensureInit();
      return getVaultEvents(vaultId, { limit: 20 });
    },
  });

  // Find the owner's OwnerCap for this vault
  const { data: ownerCapId } = useQuery({
    queryKey: ["owner-cap", vaultId, account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      ensureInit();
      const caps = await getOwnerCaps(account.address);
      const match = caps.find((c) => c.vaultId === vaultId);
      return match?.id ?? null;
    },
    enabled: !!account?.address,
  });

  if (isLoading) return <div className="text-gray-400">Loading vault...</div>;
  if (error)
    return <div className="text-red-400">Error: {error.message}</div>;
  if (!vault) return <div className="text-gray-400">Vault not found</div>;

  const remaining = vault.policy.maxBudget - vault.totalSpent;
  const isOwner = !!ownerCapId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vault</h1>
          <p className="font-mono text-xs text-gray-400 break-all">
            {vault.id}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded text-sm ${
            vault.status === 0
              ? "bg-green-500/20 text-green-400"
              : vault.status === 1
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          {STATUS_LABELS[vault.status] ?? "Unknown"}
        </span>
      </div>

      {/* Balance */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="text-sm text-gray-400 mb-1">Balance</div>
        <div className="text-3xl font-bold">
          {(Number(vault.balance) / 1e9).toFixed(4)} SUI
        </div>
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <VaultActions
          vaultId={vaultId}
          ownerCapId={ownerCapId}
          status={vault.status}
          balanceSui={Number(vault.balance) / 1e9}
        />
      )}

      {/* Policy */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Policy</h2>
          {isOwner && !showPolicyForm && (
            <button
              onClick={() => setShowPolicyForm(true)}
              className="text-sm px-3 py-1 rounded border border-blue-600 text-blue-400 hover:bg-blue-600/20 transition-colors"
            >
              Edit Policy
            </button>
          )}
        </div>

        {showPolicyForm && isOwner ? (
          <VaultPolicyForm
            vaultId={vaultId}
            ownerCapId={ownerCapId}
            currentPolicy={vault.policy}
            onClose={() => setShowPolicyForm(false)}
          />
        ) : (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Max Budget</dt>
              <dd>
                {(Number(vault.policy.maxBudget) / 1e9).toFixed(2)} SUI
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Max Per Tx</dt>
              <dd>
                {(Number(vault.policy.maxPerTx) / 1e9).toFixed(2)} SUI
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Remaining Budget</dt>
              <dd>{(Number(remaining) / 1e9).toFixed(2)} SUI</dd>
            </div>
            <div>
              <dt className="text-gray-400">Cooldown</dt>
              <dd>{vault.policy.cooldownMs / 1000}s</dd>
            </div>
            <div>
              <dt className="text-gray-400">Allowed Actions</dt>
              <dd>
                {vault.policy.allowedActions
                  .map((a) => ACTION_LABELS[a] ?? `#${a}`)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Expires</dt>
              <dd>{new Date(vault.policy.expiresAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Stats</h2>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-400">Total Spent</dt>
            <dd>{(Number(vault.totalSpent) / 1e9).toFixed(4)} SUI</dd>
          </div>
          <div>
            <dt className="text-gray-400">Transactions</dt>
            <dd>{vault.txCount}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Authorized Agents</dt>
            <dd>{vault.authorizedCaps.length}</dd>
          </div>
        </dl>
      </div>

      {/* Agent Management */}
      {isOwner && (
        <VaultAgents
          vaultId={vaultId}
          ownerCapId={ownerCapId}
          authorizedCaps={vault.authorizedCaps}
        />
      )}

      {/* Event History */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {!events?.events.length ? (
          <p className="text-gray-400 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {events.events.map((event, i) => (
              <div
                key={`${event.txDigest}-${i}`}
                className="flex items-center justify-between py-2 border-b border-gray-800 text-sm"
              >
                <div>
                  <span className="text-gray-400">
                    {ACTION_LABELS[event.actionType] ?? "Unknown"}
                  </span>
                  <span className="ml-2 font-mono">
                    {(Number(event.amount) / 1e9).toFixed(4)} SUI
                  </span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
