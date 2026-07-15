import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Set the dark class before paint to avoid a flash of the wrong theme.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('maroon:theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Maroon - Earn yield in one tap",
  description:
    "Earn real DeFi yield in one tap. No wallet, gas, or chains to manage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        {children}
        <StoreInitializer
          keys={{
            magicApiKey: process.env.MAGIC_API_KEY,
            projectId: process.env.PARTICLE_PROJECT_ID,
            clientKey: process.env.PARTICLE_CLIENT_KEY,
            appId: process.env.PARTICLE_APP_ID,
          }}
        />
      </body>
    </html>
  );
}
