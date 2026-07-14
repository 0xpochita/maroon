import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Vaults", href: "/defi" },
      { label: "Earn plans", href: "/" },
      { label: "Portfolio", href: "/profile" },
      { label: "How it works", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Support", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: FaXTwitter, href: "#", label: "X" },
  { icon: FaGithub, href: "#", label: "GitHub" },
  { icon: FaDiscord, href: "#", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Assets/Images/Logo/logo-brands/maroon-logo.png"
                alt="Maroon"
                width={32}
                height={28}
              />
              <span className="text-lg font-semibold tracking-tight">
                Maroon
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              One-tap DeFi earning for everyone. Deposit stablecoins, earn
              yield, skip the crypto complexity.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold">{column.title}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Maroon. All rights reserved.</p>
          <p>Powered by Particle Network &amp; LI.FI</p>
          <div className="flex gap-4">
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
