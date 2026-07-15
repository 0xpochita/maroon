import { VaultBrowser } from "@/components/(main)/VaultBrowser";
import { fetchVaults } from "@/lib/lifi";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; chain?: string }>;
}) {
  const { category, chain } = await searchParams;
  const vaults = await fetchVaults();
  return <VaultBrowser vaults={vaults} category={category} chain={chain} />;
}
