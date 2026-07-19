import { type NextRequest, NextResponse } from "next/server";
import { USDC_BY_ID, USDT_BY_ID } from "@/lib/lifi";

const NATIVE = "0x0000000000000000000000000000000000000000";
const SOL_MINT = "So11111111111111111111111111111111111111112";

// Map a source-token symbol to its address on the given chain. Returns
// undefined when unsupported so the caller falls back to the vault asset.
function resolveSource(
  symbol: string | undefined,
  chainId: number,
): string | undefined {
  if (!symbol) return undefined;
  const s = symbol.toUpperCase();
  if (s === "USDC") return USDC_BY_ID[chainId];
  if (s === "USDT") return USDT_BY_ID[chainId];
  if (s === "ETH" || s === "BNB") return NATIVE;
  if (s === "SOL") return SOL_MINT;
  return undefined;
}

// Builds a LI.FI Composer deposit quote for a vault. Runs server-side so
// LIFI_API_KEY never reaches the browser.
export async function POST(req: NextRequest) {
  const key = process.env.LIFI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "LIFI_API_KEY not set" },
      { status: 503 },
    );
  }

  const body = await req.json();
  const {
    chainId,
    vaultAddress,
    tokenAddress,
    fromAddress,
    amount,
    fromToken,
    fromChainId,
  } = body;
  const srcChain = Number(fromChainId) || chainId;
  const source =
    resolveSource(fromToken, srcChain) ?? tokenAddress ?? USDC_BY_ID[chainId];

  if (!chainId || !vaultAddress || !fromAddress || !source || !amount) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const url = new URL("https://li.quest/v1/quote");
  url.searchParams.set("fromChain", String(srcChain));
  url.searchParams.set("toChain", String(chainId));
  url.searchParams.set("fromToken", source);
  url.searchParams.set("toToken", vaultAddress);
  url.searchParams.set("fromAddress", fromAddress);
  url.searchParams.set("toAddress", fromAddress);
  url.searchParams.set("fromAmount", String(amount));

  const res = await fetch(url, { headers: { "x-lifi-api-key": key } });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message ?? "quote failed" },
      { status: res.status },
    );
  }

  return NextResponse.json({
    transactionRequest: data.transactionRequest,
    // Address the source token must be approved to spend (the LI.FI router).
    // Null for native tokens. The client prepends an ERC20 approval so the
    // router's transferFrom doesn't revert in simulation.
    approvalAddress: data.estimate?.approvalAddress ?? null,
    fromTokenAddress: source,
    fromAmount: String(amount),
  });
}
