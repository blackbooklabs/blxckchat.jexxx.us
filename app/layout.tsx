import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DomainRouting } from "@/components/DomainRouting";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlxckChat | Motion UI",
  description: "A highly interactive, animated chat interface built with Next.js 14 and Framer Motion",
  keywords: ["chat", "motion", "ui", "nextjs", "framer-motion", "real-time"],
  authors: [{ name: "BlxckBook" }],
  creator: "BlxckBook",
  metadataBase: new URL("https://blxckchat.jexxx.us"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BlxckChat",
    title: "BlxckChat | Motion UI",
    description: "A highly interactive, animated chat interface built with Next.js 14 and Framer Motion",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlxckChat | Motion UI",
    description: "A highly interactive, animated chat interface built with Next.js 14 and Framer Motion",
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {/* Global background gradient */}
        <div className="fixed inset-0 bg-background -z-10" />
        <div className="fixed inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-muted/5 -z-10 pointer-events-none" />
        
        {/* Domain routing for sacred path configuration */}
        <DomainRouting>
          {/* Main content wrapper */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </DomainRouting>
      </body>
    </html>
  );
}
