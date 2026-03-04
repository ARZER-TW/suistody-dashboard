"use client";

import { useState } from "react";
import {
  buildDepositFromGas,
  buildWithdrawAll,
  buildPause,
  buildUnpause,
  suiToMist,
} from "@suistody/core";
import { ensureInit } from "@/lib/suistody";
import { useSignExecute } from "@/hooks/use-sign-execute";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface VaultActionsProps {
  vaultId: string;
  ownerCapId: string;
  status: number;
  balanceSui: number;
}

export function VaultActions({
  vaultId,
  ownerCapId,
  status,
  balanceSui,
}: VaultActionsProps) {
  const account = useCurrentAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);

  const { execute, isPending, error, lastDigest } = useSignExecute({
    invalidateKeys: [
      ["vault", vaultId],
      ["vaults", account?.address ?? ""],
    ],
  });

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositAmount) return;
    ensureInit();

    const tx = buildDepositFromGas({
      vaultId,
      ownerCapId,
      amount: suiToMist(Number(depositAmount)),
    });

    const digest = await execute(tx);
    if (digest) {
      setDepositAmount("");
      setShowDeposit(false);
    }
  }

  async function handleWithdrawAll() {
    if (!account?.address) return;
    ensureInit();

    const tx = buildWithdrawAll({
      vaultId,
      ownerCapId,
      recipientAddress: account.address,
    });

    await execute(tx);
  }

  async function handleTogglePause() {
    ensureInit();

    const tx =
      status === 0
        ? buildPause({ vaultId, ownerCapId })
        : buildUnpause({ vaultId, ownerCapId });

    await execute(tx);
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Actions</h2>

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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowDeposit(!showDeposit)}
          disabled={isPending}
          className="px-4 py-2 text-sm rounded border border-green-600 text-green-400 hover:bg-green-600/20 disabled:opacity-50 transition-colors"
        >
          Deposit
        </button>

        <button
          onClick={handleWithdrawAll}
          disabled={isPending || balanceSui === 0}
          className="px-4 py-2 text-sm rounded border border-orange-600 text-orange-400 hover:bg-orange-600/20 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Processing..." : "Withdraw All"}
        </button>

        <button
          onClick={handleTogglePause}
          disabled={isPending}
          className={`px-4 py-2 text-sm rounded border transition-colors disabled:opacity-50 ${
            status === 0
              ? "border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
              : "border-blue-600 text-blue-400 hover:bg-blue-600/20"
          }`}
        >
          {isPending
            ? "Processing..."
            : status === 0
              ? "Pause Vault"
              : "Resume Vault"}
        </button>
      </div>

      {showDeposit && (
        <form onSubmit={handleDeposit} className="mt-4 flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount in SUI"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-700 transition-colors"
          >
            {isPending ? "..." : "Confirm"}
          </button>
        </form>
      )}
    </div>
  );
}
