import { type NextRequest, NextResponse } from "next/server";
import { USDC_BY_ID } from "@/lib/lifi";

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
  const { chainId, vaultAddress, tokenAddress, fromAddress, amount } = body;
  const usdc = tokenAddress || USDC_BY_ID[chainId];

  if (!chainId || !vaultAddress || !fromAddress || !usdc || !amount) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const url = new URL("https://li.quest/v1/quote");
  url.searchParams.set("fromChain", String(chainId));
  url.searchParams.set("toChain", String(chainId));
  url.searchParams.set("fromToken", usdc);
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

  return NextResponse.json({ transactionRequest: data.transactionRequest });
}
