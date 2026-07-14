"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useState } from "react";

const NOTIFS = [
  {
    id: "n1",
    title: "Yield paid",
    desc: "+$12.40 added to your USDC balance",
    time: "15m",
    unread: true,
  },
  {
    id: "n2",
    title: "Deposit confirmed",
    desc: "$500 into Aave on Base",
    time: "2h",
    unread: true,
  },
  {
    id: "n3",
    title: "New vault live",
    desc: "Euler Finance on Arbitrum at 14.30% APY",
    time: "1d",
    unread: false,
  },
];

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
      >
        <Bell className="size-5" />
        <span className="absolute top-2.5 right-2.5 size-2 rounded-full border-2 border-surface bg-primary" />
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="font-semibold">Notifications</p>
                <button
                  type="button"
                  className="text-xs font-medium text-primary"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {NOTIFS.map((notif) => (
                  <li
                    key={notif.id}
                    className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${notif.unread ? "bg-primary" : "bg-transparent"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notif.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {notif.time}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
