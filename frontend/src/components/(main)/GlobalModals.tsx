"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { useUiStore } from "@/stores/ui";
import { AuthModal } from "./AuthModal";
import { DepositModal } from "./DepositModal";
import { EarnModal } from "./EarnModal";

// Single mount point for the app-wide modals. Open state comes from the UI store;
// account actions come from the account store.
export function GlobalModals() {
  const authMode = useUiStore((s) => s.authMode);
  const closeAuth = useUiStore((s) => s.closeAuth);
  const depositOpen = useUiStore((s) => s.depositOpen);
  const closeDeposit = useUiStore((s) => s.closeDeposit);
  const earnVault = useUiStore((s) => s.earnVault);
  const closeEarn = useUiStore((s) => s.closeEarn);
  const status = useAccountStore((s) => s.status);
  const loginWithEmail = useAccountStore((s) => s.loginWithEmail);

  // Close the auth modal once the account is connected.
  useEffect(() => {
    if (status === "ready") closeAuth();
  }, [status, closeAuth]);

  return (
    <>
      <AuthModal
        open={authMode !== null}
        onClose={closeAuth}
        onEmail={loginWithEmail}
        busy={status === "connecting"}
      />
      <DepositModal open={depositOpen} onClose={closeDeposit} />
      <AnimatePresence>
        {earnVault ? <EarnModal vault={earnVault} onClose={closeEarn} /> : null}
      </AnimatePresence>
    </>
  );
}
