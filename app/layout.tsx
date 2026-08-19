import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "@/app/providers";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WebGpuStatus } from "@/components/WebGpuStatus";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tap Power. Turn a quiet tab into power",
  description:
    "Open a browser tab and share unused CPU/GPU. Earn a pump.fun token plus SOL, or pay to run AI inference, rendering, and data jobs on Solana via WebGPU.",
  openGraph: {
    title: "Tap Power. Turn a quiet tab into power",
    description:
    "Solana-funded compute coordination. Share a worker, earn SOL, or rent approved compute.",
    images: ["/hero.jpg"],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <AmbientBackground />
          <Navbar />
          {children}
          <Footer />
          <WebGpuStatus />
        </Providers>
      </body>
    </html>
  );
}
