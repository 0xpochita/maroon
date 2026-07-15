"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut, Moon, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccountStore } from "@/stores/account";
import { useThemeStore } from "@/stores/theme";

function shorten(address?: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const MENU: MenuItem[] = [
  { icon: User, label: "View profile", href: "/profile" },
];

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover-to-open wrapper; the inner button stays keyboard and click accessible
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Account"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1"
      >
        <span className="size-9 rounded-full bg-gradient-to-br from-primary to-warning" />
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open ? <ProfileDropdown onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const dark = useThemeStore((s) => s.dark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const address = useAccountStore((s) => s.address);
  const logout = useAccountStore((s) => s.logout);
  return (
    <motion.div
      className="absolute right-0 top-full z-50 w-64 pt-2"
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl">
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="size-8 rounded-full bg-gradient-to-br from-primary to-warning" />
          <span className="font-mono text-sm font-semibold">
            {shorten(address)}
          </span>
        </div>
        <div className="my-1 h-px bg-border" />
        <ul>
          {MENU.map((item) => (
            <MenuRow key={item.label} item={item} onClose={onClose} />
          ))}
        </ul>
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Moon className="size-4 text-muted-foreground" />
          <span className="flex-1 text-left">Dark mode</span>
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted-strong"}`}
          >
            <span
              className={`absolute top-0.5 size-4 rounded-full bg-surface transition-all ${dark ? "left-[18px]" : "left-0.5"}`}
            />
          </span>
        </button>
        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => {
            onClose();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </motion.div>
  );
}

function MenuRow({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClose}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Icon className="size-4 text-muted-foreground" />
        {item.label}
      </Link>
    </li>
  );
}
