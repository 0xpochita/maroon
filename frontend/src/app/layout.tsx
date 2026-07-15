import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers
          magicApiKey={process.env.MAGIC_API_KEY}
          particle={{
            projectId: process.env.PARTICLE_PROJECT_ID,
            clientKey: process.env.PARTICLE_CLIENT_KEY,
            appId: process.env.PARTICLE_APP_ID,
          }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
