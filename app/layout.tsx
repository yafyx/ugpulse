import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans, fontMono } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body
        className={clsx(
          "bg-zinc-100 font-sans text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100",
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex min-h-screen flex-col">
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/30"></div>
              <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-zinc-300/30 blur-3xl dark:bg-zinc-700/20"></div>
              <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-zinc-200/20 blur-3xl dark:bg-zinc-800/10"></div>
            </div>

            <div className="fixed left-0 right-0 top-0 z-30 h-1 bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent"></div>

            <Navbar />
            <main className="container mx-auto flex-grow px-4 pt-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
