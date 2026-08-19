import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/app/providers";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NetworkStatus } from "@/components/NetworkStatus";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TabPower — Turn Your Browser Into Income",
  description:
    "Open a browser tab and rent out unused CPU/GPU. Earn a pump.fun token plus SOL, or pay to run AI inference, rendering, and data jobs on Solana via WebGPU.",
  openGraph: {
    title: "TabPower — Turn Your Browser Into Income",
    description:
      "Decentralized browser compute on Solana. Share a tab. Earn PF + SOL. Rent the mesh. No downloads.",
    images: ["/hero.jpg"],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <AmbientBackground />
          <Navbar />
          {children}
          <Footer />
          <NetworkStatus />
        </Providers>
      </body>
    </html>
  );
}
