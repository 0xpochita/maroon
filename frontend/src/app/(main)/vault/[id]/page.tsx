import { VaultDetails } from "@/components/(main)/VaultDetails";
import { vaults } from "@/lib/mock/earn";

export function generateStaticParams() {
  return vaults.map((vault) => ({ id: vault.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VaultDetails id={id} />;
}
