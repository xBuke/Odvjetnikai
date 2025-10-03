import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import ClientProviders from "@/components/providers/ClientProviders";
import RouteProtection from "@/components/auth/RouteProtection";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LawFirm SaaS - Professional Legal Management",
  description: "Modern law firm management software for cases, clients, and billing",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <RouteProtection>
            <MainLayout>
              {children}
            </MainLayout>
          </RouteProtection>
        </ClientProviders>
      </body>
    </html>
  );
}
