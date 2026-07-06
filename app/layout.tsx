import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { DomainRouting } from "@/components/DomainRouting";
import JsonLd from "@/components/JsonLd";
import {
  PAGE_METADATA,
  generateOrganizationSchema,
  generateFAQSchema,
} from "@/lib/metadata.config";

export const dynamic = "force-dynamic";

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

// Enhanced SEO Metadata
export const metadata: Metadata = {
  ...PAGE_METADATA.home,
  metadataBase: new URL("https://blxckchat.jexxx.us"),
  authors: [{ name: "JEXXXUS Empire" }],
  creator: "JEXXXUS Empire",
  publisher: "JEXXXUS Empire",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console code
  },
  category: "technology",
  classification: "AI Chat Platform",
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
  const isLocalBypass = process.env.NODE_ENV === "development";
  const SafeClerkProvider = isLocalBypass
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : ClerkProvider;

  return (
    <SafeClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          {/* Structured Data */}
          <JsonLd data={generateOrganizationSchema()} />
          <JsonLd data={generateFAQSchema()} />
        </head>
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
          <Analytics />
        </body>
      </html>
    </SafeClerkProvider>
  );
}
