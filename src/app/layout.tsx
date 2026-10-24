import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ClientBoot from "@/components/ClientBoot";
import Toaster from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "بروست الأسد | Broast El-Assad — طعم يليق بالأسود",
    template: "%s | Broast El-Assad",
  },
  description:
    "بروست الأسد — أكرسبي بروست في دسوق. دجاج طازج يومياً، تتبيلة سرية من 1998، وتوصيل سريع لحد باب البيت. Egyptian crispy broast, pressure-fried fresh, delivered hot.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/img/icon-512.png", apple: "/img/icon-512.png" },
  openGraph: {
    title: "بروست الأسد | Broast El-Assad",
    description: "طعم يليق بالأسود — A Taste Fit for Lions",
    images: ["/img/hero-classic.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg font-sans text-ink antialiased">
        <ClientBoot />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
