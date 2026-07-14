import { VaultBrowser } from "@/components/(main)/VaultBrowser";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; chain?: string }>;
}) {
  const { category, chain } = await searchParams;
  return <VaultBrowser category={category} chain={chain} />;
}
