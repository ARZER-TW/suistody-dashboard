import { VaultList } from "@/components/vault-list";
import { CreateVaultButton } from "@/components/create-vault-button";

export default function Home() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Vaults</h1>
        <CreateVaultButton />
      </div>
      <VaultList />
    </div>
  );
}
