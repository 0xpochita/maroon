"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const DEFI = "/Assets/Images/Logo/logo-defi";
const CHAIN = "/Assets/Images/Logo/logo-chain";
const BASE = `${CHAIN}/base-logo.jpg`;
const ARB = `${CHAIN}/arb-logo.svg`;

const ACTIVITY = [
  {
    user: "0x3f..a1",
    action: "deposited",
    amount: "$500",
    time: "2m",
    protocol: "Aave",
    chain: "Base",
    logo: `${DEFI}/aave-logo.webp`,
    chainLogo: BASE,
  },
  {
    user: "0x9c..2b",
    action: "deposited",
    amount: "$1,200",
    time: "8m",
    protocol: "Morpho",
    chain: "Base",
    logo: `${DEFI}/morpho-logo.webp`,
    chainLogo: BASE,
  },
  {
    user: "0x7d..e4",
    action: "earned",
    amount: "+$12.40",
    time: "15m",
    protocol: "Euler Finance",
    chain: "Base",
    logo: `${DEFI}/euler-logo.png`,
    chainLogo: BASE,
  },
  {
    user: "0x1a..8f",
    action: "deposited",
    amount: "$300",
    time: "23m",
    protocol: "Aave",
    chain: "Arbitrum",
    logo: `${DEFI}/aave-logo.webp`,
    chainLogo: ARB,
  },
  {
    user: "0x5e..c0",
    action: "withdrew",
    amount: "$250",
    time: "31m",
    protocol: "Morpho",
    chain: "Arbitrum",
    logo: `${DEFI}/morpho-logo.webp`,
    chainLogo: ARB,
  },
  {
    user: "0x2b..d7",
    action: "deposited",
    amount: "$820",
    time: "44m",
    protocol: "Euler Finance",
    chain: "Arbitrum",
    logo: `${DEFI}/euler-logo.png`,
    chainLogo: ARB,
  },
];

export function ActivityFeed() {
  const reduceMotion = useReducedMotion();
  const items = [...ACTIVITY, ...ACTIVITY];
  return (
    <div className="relative mt-3 h-40 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-surface to-transparent" />
      <motion.ul
        className="flex flex-col gap-3.5"
        animate={reduceMotion ? undefined : { y: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 16,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }
        }
      >
        {items.map((item, index) => (
          <li key={`${item.user}-${index}`} className="flex items-center gap-3">
            <span className="relative shrink-0">
              <Image
                src={item.logo}
                alt={item.protocol}
                width={28}
                height={28}
                className="size-7 rounded-full object-contain"
              />
              <Image
                src={item.chainLogo}
                alt={item.chain}
                width={14}
                height={14}
                className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border border-surface object-cover"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{item.user}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {item.action} {item.amount}
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.protocol} · {item.chain}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.time}
            </span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
