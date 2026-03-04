"use client";

import Link from "next/link";

interface VaultCardProps {
  id: string;
  balanceSui: number;
  status: number;
  policyMaxBudgetSui: number;
  totalSpentSui: number;
  txCount: number;
  allowedActions: number[];
}

const STATUS_LABELS: Record<number, string> = {
  0: "Active",
  1: "Paused",
  2: "Locked",
};

const STATUS_COLORS: Record<number, string> = {
  0: "bg-green-500/20 text-green-400",
  1: "bg-yellow-500/20 text-yellow-400",
  2: "bg-red-500/20 text-red-400",
};

export function VaultCard(props: VaultCardProps) {
  const remaining = props.policyMaxBudgetSui - props.totalSpentSui;
  const statusLabel = STATUS_LABELS[props.status] ?? "Unknown";
  const statusColor = STATUS_COLORS[props.status] ?? "bg-gray-500/20 text-gray-400";

  return (
    <Link href={`/vault/${props.id}`}>
      <div className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-gray-400 truncate max-w-[200px]">
            {props.id}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <div className="text-2xl font-bold mb-2">
          {props.balanceSui.toFixed(4)} SUI
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          <div>
            <div className="text-xs uppercase tracking-wide">Budget</div>
            <div>{remaining.toFixed(2)} / {props.policyMaxBudgetSui.toFixed(2)} SUI</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide">Transactions</div>
            <div>{props.txCount}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
