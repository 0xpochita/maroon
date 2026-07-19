import { NextResponse } from "next/server";
import { CHAIN_NAMES, fetchVaults, type Position } from "@/lib/lifi";

// Active vault positions for a wallet (LI.FI Earn portfolio endpoint). The
// portfolio API only returns chainId/address/protocolName/asset/balanceUsd, so
// we join each position to the vault list (server-side) to enrich name, APY,
// protocol logo and chain. LIFI_API_KEY stays server-only.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> },
) {
  const key = process.env.LIFI_API_KEY;
  const { address } = await ctx.params;
  if (!key) return NextResponse.json({ positions: [] });
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "bad address" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://earn.li.fi/v1/portfolio/${address}/positions`,
      // No cache: a fresh deposit must show as soon as LI.FI indexes it.
      { headers: { "x-lifi-api-key": key }, cache: "no-store" },
    );
    if (!res.ok) return NextResponse.json({ positions: [] });
    const data = await res.json();
    // biome-ignore lint/suspicious/noExplicitAny: LI.FI response is untyped
    const raw: any[] = Array.isArray(data)
      ? data
      : (data?.positions ?? data?.data ?? []);

    const vaults = await fetchVaults();
    const byAddress = new Map(
      vaults.map((v) => [String(v.vaultAddress).toLowerCase(), v]),
    );

    const positions: Position[] = raw
      // Keep any position with a vault address; a null/0 balance can be a
      // just-deposited position LI.FI is still valuing.
      .filter((p) => p?.address)
      .map((p) => {
        const match = byAddress.get(String(p.address).toLowerCase());
        const chainId = Number(p.chainId);
        return {
          vaultAddress: String(p.address),
          chainId,
          chain: match?.chain ?? CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
          protocol:
            match?.protocol.name ??
            String(p.protocolName ?? "Vault").replace(/\b\w/g, (c) =>
              c.toUpperCase(),
            ),
          logo: match?.protocol.logo ?? "",
          asset: match?.asset ?? String(p.asset?.symbol ?? "USDC"),
          name: match?.name,
          balanceUsd: Number(p.balanceUsd ?? 0),
          apy: match?.apy,
        };
      });

    return NextResponse.json({ positions });
  } catch (error) {
    console.error("portfolio positions failed", error);
    return NextResponse.json({ positions: [] });
  }
}
