import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WalletConnectButton } from "@/components/connect-button";
import { SuiPrice } from "@/components/sui-price";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suistody Dashboard",
  description: "AI Agent custody management on Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white min-h-screen`}
      >
        <Providers>
          <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-lg font-bold">
                Suistody
              </a>
              <SuiPrice />
            </div>
            <WalletConnectButton />
          </header>
          <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
