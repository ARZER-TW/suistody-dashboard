import { VaultDetail } from "@/components/vault-detail";
import Link from "next/link";

export default async function VaultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-blue-400 hover:underline mb-4 inline-block"
      >
        &larr; Back to vaults
      </Link>
      <VaultDetail vaultId={id} />
    </div>
  );
}
