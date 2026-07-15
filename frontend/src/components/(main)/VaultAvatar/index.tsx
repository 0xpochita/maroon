import Image from "next/image";
import { chainLogos } from "@/lib/mock/earn";
import type { Vault } from "@/types/earn";

export function VaultAvatar({
  vault,
  size = 40,
}: {
  vault: Vault;
  size?: number;
}) {
  const chainLogo = chainLogos[vault.chain];
  const badge = Math.round(size * 0.45);
  return (
    <span className="relative shrink-0">
      {vault.protocol.logo ? (
        <Image
          src={vault.protocol.logo}
          alt={vault.protocol.name}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="rounded-full object-contain"
          unoptimized={vault.protocol.logo.startsWith("http")}
        />
      ) : (
        <span
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-full bg-muted text-xs font-bold uppercase"
        >
          {vault.protocol.name.slice(0, 2)}
        </span>
      )}
      {chainLogo ? (
        <Image
          src={chainLogo}
          alt={vault.chain}
          width={badge}
          height={badge}
          style={{ width: badge, height: badge }}
          className="absolute -right-0.5 -bottom-0.5 rounded-full border-2 border-surface bg-surface object-contain"
        />
      ) : null}
    </span>
  );
}
