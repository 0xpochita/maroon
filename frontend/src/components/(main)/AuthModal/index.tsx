"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function AuthModal({
  open,
  onClose,
  onEmail,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onEmail: (email: string) => void;
  busy?: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? <Panel onClose={onClose} onEmail={onEmail} busy={busy} /> : null}
    </AnimatePresence>
  );
}

function Panel({
  onClose,
  onEmail,
  busy,
}: {
  onClose: () => void;
  onEmail: (email: string) => void;
  busy?: boolean;
}) {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <Image
            src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
            alt="Maroon"
            width={44}
            height={39}
          />
          <h2 className="mt-3 text-xl font-semibold">Welcome to Maroon</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start earning yield in one tap. No wallet, no seed phrase.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
          <Mail className="size-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && valid) onEmail(email);
            }}
            placeholder="you@email.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={() => onEmail(email)}
          disabled={!valid || busy}
          className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_0_var(--color-primary-hover)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--color-primary-hover)] disabled:opacity-50 disabled:shadow-none"
        >
          {busy ? "Signing in..." : "Continue with email"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy.
        </p>
      </motion.div>
    </div>
  );
}
