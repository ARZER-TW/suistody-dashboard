"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { getOwnedVaults } from "@suistody/core";
import { ensureInit } from "@/lib/suistody";
import { VaultCard } from "./vault-card";

export function VaultList() {
  const account = useCurrentAccount();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vaults", account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      ensureInit();
      return getOwnedVaults(account.address);
    },
    enabled: !!account?.address,
  });

  if (!account) {
    return (
      <div className="text-center py-12 text-gray-400">
        Connect your wallet to view vaults.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading vaults...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load vaults: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No vaults found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((vault) => (
        <VaultCard
          key={vault.id}
          id={vault.id}
          balanceSui={Number(vault.balance) / 1e9}
          status={vault.status}
          policyMaxBudgetSui={Number(vault.policy.maxBudget) / 1e9}
          totalSpentSui={Number(vault.totalSpent) / 1e9}
          txCount={vault.txCount}
          allowedActions={vault.policy.allowedActions}
        />
      ))}
    </div>
  );
}
