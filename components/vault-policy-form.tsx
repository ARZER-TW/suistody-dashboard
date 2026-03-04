"use client";

import { useState } from "react";
import { buildUpdatePolicy, suiToMist } from "@suistody/core";
import type { Policy } from "@suistody/core";
import { ensureInit } from "@/lib/suistody";
import { useSignExecute } from "@/hooks/use-sign-execute";
import { useCurrentAccount } from "@mysten/dapp-kit";

const ACTION_OPTIONS = [
  { value: 0, label: "Swap" },
  { value: 1, label: "Stable Mint" },
  { value: 2, label: "Stable Burn" },
  { value: 3, label: "Stable Claim" },
];

interface VaultPolicyFormProps {
  vaultId: string;
  ownerCapId: string;
  currentPolicy: Policy;
  onClose: () => void;
}

export function VaultPolicyForm({
  vaultId,
  ownerCapId,
  currentPolicy,
  onClose,
}: VaultPolicyFormProps) {
  const account = useCurrentAccount();
  const [maxBudget, setMaxBudget] = useState(
    (Number(currentPolicy.maxBudget) / 1e9).toString()
  );
  const [maxPerTx, setMaxPerTx] = useState(
    (Number(currentPolicy.maxPerTx) / 1e9).toString()
  );
  const [cooldownSec, setCooldownSec] = useState(
    (currentPolicy.cooldownMs / 1000).toString()
  );
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [selectedActions, setSelectedActions] = useState<number[]>(
    currentPolicy.allowedActions
  );

  const { execute, isPending, error, lastDigest } = useSignExecute({
    invalidateKeys: [
      ["vault", vaultId],
      ["vaults", account?.address ?? ""],
    ],
    onSuccess: () => {
      setTimeout(onClose, 2000);
    },
  });

  function toggleAction(action: number) {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ensureInit();

    const expiresAt = BigInt(
      Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000
    );

    const tx = buildUpdatePolicy({
      vaultId,
      ownerCapId,
      maxBudget: suiToMist(Number(maxBudget)),
      maxPerTx: suiToMist(Number(maxPerTx)),
      allowedActions: selectedActions,
      cooldownMs: BigInt(Number(cooldownSec) * 1000),
      expiresAt,
    });

    await execute(tx);
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Update Policy</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-400">Max Budget (SUI)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-400">Max Per Tx (SUI)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={maxPerTx}
              onChange={(e) => setMaxPerTx(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-400">Cooldown (seconds)</span>
            <input
              type="number"
              min="0"
              value={cooldownSec}
              onChange={(e) => setCooldownSec(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-400">Expires In (days)</span>
            <input
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
              required
            />
          </label>
        </div>

        <div>
          <span className="text-sm text-gray-400">Allowed Actions</span>
          <div className="flex gap-2 mt-2">
            {ACTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleAction(opt.value)}
                className={`text-xs px-3 py-1 rounded border ${
                  selectedActions.includes(opt.value)
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 rounded p-2">
            {error}
          </div>
        )}

        {lastDigest && (
          <div className="text-green-400 text-sm bg-green-500/10 rounded p-2">
            Policy updated! Tx: {lastDigest.slice(0, 16)}...
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || selectedActions.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded py-2 text-sm font-medium transition-colors"
        >
          {isPending ? "Updating..." : "Update Policy"}
        </button>
      </form>
    </div>
  );
}
