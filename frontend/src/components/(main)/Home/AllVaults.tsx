import Image from "next/image";
import Link from "next/link";
import type { Vault } from "@/types/earn";
import { AllVaultsBrowser } from "./AllVaultsBrowser";

export function AllVaults({ vaults }: { vaults: Vault[] }) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Image
            src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
            alt="Maroon"
            width={24}
            height={21}
          />
          All vaults
        </h2>
        <Link
          href="/defi"
          className="ml-auto text-sm font-semibold text-primary hover:underline"
        >
          Explore all
        </Link>
      </div>
      <div className="mt-4">
        <AllVaultsBrowser vaults={vaults} />
      </div>
    </section>
  );
}
