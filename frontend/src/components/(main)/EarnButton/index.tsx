"use client";

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

  const handleClick = () => {
    if (status !== "ready") {
      openAuth("login");
      return;
    }
    openEarn(vault);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
