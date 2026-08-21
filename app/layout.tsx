import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WebGpuStatus } from "@/components/WebGpuStatus";
import "./globals.css";

const sans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-sans" });
const mono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ComputeFi — Put idle compute to work.",
  description:
    "Financial infrastructure for compute. Share unused CPU and GPU capacity and earn SOL, or rent distributed compute and pay only for verified work.",
  openGraph: {
    title: "ComputeFi — Put idle compute to work.",
    description:
    "The decentralized compute marketplace on Solana.",
    images: ["/logo.png"],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
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
