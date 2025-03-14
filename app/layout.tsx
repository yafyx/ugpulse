import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icons/icon-192x192.png" },
      { url: "/icons/icon-512x512.png" },
    ],
  },
  applicationName: "UG Connect",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UGC",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className={fontSans.variable}>
      <body
        className={clsx(
          "bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] font-sans antialiased dark:from-[#000000] dark:to-[#000000]",
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="container mx-auto max-w-full flex-grow pt-8 sm:px-4">
              {children}
            </main>
            <footer
              className="flex w-full items-center justify-center py-3"
              aria-label="Footer"
            >
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} UG Connect
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
