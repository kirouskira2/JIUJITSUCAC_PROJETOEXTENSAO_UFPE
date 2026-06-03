import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/splash-screen";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

import { RetroGrid } from "@/components/ui/retro-grid";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jiujitsucac.vercel.app"),
  title: "JJCAC | Jiu-Jitsu para Todos",
  description: "Plataforma de Gestão para o Projeto Social Jiu-Jitsu para Todos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JJCAC",
  },
  icons: {
    icon: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505", // bgBase
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceMono.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground relative overflow-x-hidden selection:bg-red-500/30">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} nonce={nonce}>
          <div className="relative min-h-screen w-full flex flex-col">
            <RetroGrid className="absolute inset-0 z-0" />
            <div className="relative z-10 flex-1 flex flex-col">
              {/* Skip Link — WCAG 2.1 AA */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-bold focus:shadow-lg focus:outline-none"
              >
                Pular para o conteúdo principal
              </a>
              <main id="main-content" className="flex-1 flex flex-col">
                {children}
              </main>
            </div>
            <SplashScreen />
          </div>
          <Toaster theme="dark" />
          <Analytics />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
