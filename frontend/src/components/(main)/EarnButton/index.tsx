"use client";

import { isUaChain } from "@/lib/ua-chains";
import { useAccountStore } from "@/stores/account";
import { useUiStore } from "@/stores/ui";
import type { Vault } from "@/types/earn";

// Trigger only. The deposit modal is a single global instance (GlobalModals),
// opened through the UI store. Logged-out users are sent to the auth modal.
export function EarnButton({
  vault,
  className,
  children,
}: {
  vault: Vault;
  className: string;
  children: React.ReactNode;
}) {
  const status = useAccountStore((s) => s.status);
  const openAuth = useUiStore((s) => s.openAuth);
  const openEarn = useUiStore((s) => s.openEarn);

  // Universal Accounts can only deposit on the chains it supports. Vaults on
  // other chains still show (data layer) but the deposit is disabled.
  const depositable = isUaChain(vault.chainId);

  const handleClick = () => {
    if (status !== "ready") {
      openAuth("login");
      return;
    }
    openEarn(vault);
  };

  if (!depositable) {
    return (
      <button
        type="button"
        disabled
        title={`Deposit isn't supported on ${vault.chain} yet`}
        className={`${className} cursor-not-allowed opacity-50`}
      >
        {children}
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
