"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CreateVaultForm } from "./create-vault-form";

export function CreateVaultButton() {
  const account = useCurrentAccount();
  const [showForm, setShowForm] = useState(false);

  if (!account) return null;

  if (showForm) {
    return <CreateVaultForm onClose={() => setShowForm(false)} />;
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 transition-colors"
    >
      Create Vault
    </button>
  );
}
