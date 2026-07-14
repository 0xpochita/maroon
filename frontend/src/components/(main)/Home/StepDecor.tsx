"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaArrowTrendUp,
  FaBullseye,
  FaChartLine,
  FaCoins,
  FaDollarSign,
  FaLayerGroup,
  FaSackDollar,
  FaShieldHalved,
  FaWallet,
} from "react-icons/fa6";

interface DecorItem {
  icon: IconType;
  position: string;
  className: string;
}

const DECOR: DecorItem[][] = [
  [
    { icon: FaDollarSign, position: "top-3 right-5", className: "text-2xl" },
    { icon: FaWallet, position: "top-7 right-14", className: "text-lg" },
    { icon: FaCoins, position: "top-2 right-24", className: "text-xl" },
  ],
  [
    { icon: FaBullseye, position: "top-3 right-5", className: "text-2xl" },
    { icon: FaShieldHalved, position: "top-7 right-14", className: "text-lg" },
    { icon: FaLayerGroup, position: "top-2 right-24", className: "text-xl" },
  ],
  [
    { icon: FaArrowTrendUp, position: "top-3 right-5", className: "text-2xl" },
    { icon: FaChartLine, position: "top-7 right-14", className: "text-lg" },
    { icon: FaSackDollar, position: "top-2 right-24", className: "text-xl" },
  ],
];

export function StepDecor({ seed }: { seed: number }) {
  const reduceMotion = useReducedMotion();
  const items = DECOR[seed % DECOR.length];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-muted-foreground"
      aria-hidden="true"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.position}
            className={`absolute ${item.position} ${item.className}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -5, 0] }
            }
            transition={{
              opacity: { duration: 0.4, delay: index * 0.1 },
              scale: { duration: 0.4, delay: index * 0.1 },
              y: {
                duration: 3 + index,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <Icon />
          </motion.div>
        );
      })}
    </div>
  );
}
