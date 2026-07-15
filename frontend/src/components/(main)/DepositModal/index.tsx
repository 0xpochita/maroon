"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Landmark,
  type LucideIcon,
  QrCode,
  Smartphone,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FaCoins, FaMoneyBillWave } from "react-icons/fa6";
import QRCode from "react-qr-code";
import { formatUsd } from "@/lib/format";
import { chainLogos } from "@/lib/mock/earn";
import { useAccountStore } from "@/stores/account";

const USDC_LOGO = "/Assets/Images/Logo/logo-defi/usdc-logo.webp";
const CHAIN_SRCS = [
  chainLogos.Base,
  chainLogos.Arbitrum,
  chainLogos.Ethereum,
].filter(Boolean);
const BANNER_SRCS = [USDC_LOGO, ...CHAIN_SRCS];

// Chains we show logos for (Magic supports these EVM networks; USDC sent on any
// of them is credited to the unified balance).
const SUPPORTED = [
  { name: "Base", logo: chainLogos.Base },
  { name: "Arbitrum", logo: chainLogos.Arbitrum },
  { name: "Ethereum", logo: chainLogos.Ethereum },
].filter((c) => c.logo);

export function DepositModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? <Panel onClose={onClose} /> : null}
    </AnimatePresence>
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const address = useAccountStore((s) => s.address);
  const balanceUsd = useAccountStore((s) => s.balanceUsd);
  const openOnramp = useAccountStore((s) => s.openOnramp);
  const [tab, setTab] = useState<"crypto" | "cash">("crypto");
  const [showAddress, setShowAddress] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between">
          {showAddress ? (
            <button
              type="button"
              aria-label="Back"
              onClick={() => setShowAddress(false)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : (
            <span className="size-8" />
          )}
          <div className="text-center">
            <h2 className="text-lg font-semibold">Deposit</h2>
            <p className="text-sm text-muted-foreground">
              Balance: {formatUsd(balanceUsd ?? 0)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {showAddress ? (
          <CryptoView address={address} />
        ) : (
          <>
            <div className="mt-4 flex rounded-xl bg-muted p-1 text-sm font-medium">
              <TabButton
                active={tab === "crypto"}
                icon={FaCoins}
                onClick={() => setTab("crypto")}
              >
                Use Crypto
              </TabButton>
              <TabButton
                active={tab === "cash"}
                icon={FaMoneyBillWave}
                onClick={() => setTab("cash")}
              >
                Use Cash
              </TabButton>
            </div>

            {tab === "crypto" ? (
              <div className="mt-4 flex flex-col gap-3">
                {bannerOpen ? (
                  <Banner onDismiss={() => setBannerOpen(false)} />
                ) : null}
                <OptionRow
                  icon={QrCode}
                  title="Transfer Crypto"
                  meta="No limit · Instant"
                  trailing={<LogoCluster srcs={CHAIN_SRCS} plus />}
                  onClick={() => setShowAddress(true)}
                />
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <OptionRow
                  icon={CreditCard}
                  title="Debit or credit card"
                  meta="Instant"
                  onClick={openOnramp}
                />
                <OptionRow
                  icon={Smartphone}
                  title="Apple Pay or Google Pay"
                  meta="Instant"
                  onClick={openOnramp}
                />
                <OptionRow
                  icon={Landmark}
                  title="Bank transfer"
                  meta="1 to 2 min"
                  onClick={openOnramp}
                />
                <p className="text-center text-xs text-muted-foreground">
                  Secured by Magic. Available in 150+ countries.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 transition-colors ${active ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}

function Banner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted p-3">
      <LogoCluster srcs={BANNER_SRCS} />
      <p className="flex-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Free USDC deposits.</span>{" "}
        Across all chains, USDC deposits are credited to your balance 1:1.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function OptionRow({
  icon: Icon,
  title,
  meta,
  trailing,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      {trailing}
    </button>
  );
}

function LogoCluster({ srcs, plus }: { srcs: string[]; plus?: boolean }) {
  return (
    <span className="flex items-center">
      <span className="flex -space-x-1.5">
        {srcs.map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-full border border-surface bg-surface object-contain"
          />
        ))}
      </span>
      {plus ? (
        <span className="ml-1 text-xs text-muted-foreground">+</span>
      ) : null}
    </span>
  );
}

function CryptoView({ address }: { address?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!address) {
    return (
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Preparing your deposit address...
      </p>
    );
  }

  return (
    <div className="mt-5">
      <p className="text-center text-sm text-muted-foreground">
        Send USDC on any supported chain to this address. It is credited to your
        balance 1:1.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {SUPPORTED.map((c) => (
          <span
            key={c.name}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Image
              src={c.logo}
              alt={c.name}
              width={16}
              height={16}
              className="size-4 rounded-full object-contain"
            />
            {c.name}
          </span>
        ))}
      </div>
      <div className="mt-4 flex justify-center rounded-xl border border-border bg-surface p-4">
        <QRCode value={address} size={160} />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs">
          {address}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted-strong"
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
