import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Inter, Syncopate, VT323 } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { DomainRouting } from "@/components/DomainRouting";
import JsonLd from "@/components/JsonLd";
import {
  PAGE_METADATA,
  generateOrganizationSchema,
  generateFAQSchema,
} from "@/lib/metadata.config";
import { KingdomThemeSync } from "@/components/KingdomThemeSync";
import { ShootingStars } from "@/components/ShootingStars";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
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
    google: "your-google-verification-code",
  },
  category: "technology",
  classification: "AI Chat Platform",
};

export const viewport: Viewport = {
  themeColor: "#050508",
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#ec4899',
        },
        baseTheme: undefined, // Handled dynamically if needed, but defaults to dark usually for JEXXXUS
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
        {process.env.NEXT_PUBLIC_GTAG_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');`,
              }}
            />
          </>
        )}

          {/* Structured Data */}
          <JsonLd data={generateOrganizationSchema()} />
          <JsonLd data={generateFAQSchema()} />
          
          {/* Include Pinyon Script via standard link to avoid next/font complications with cursive */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet" />
          
          {process.env.NEXT_PUBLIC_CLARITY_ID && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");`,
              }}
            />
          )}
        </head>
        <body
          className={`${inter.variable} ${ibmPlexSans.variable} ${syncopate.variable} ${vt323.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        >
          <KingdomThemeSync />

          <div className="relative min-h-screen bg-background isolate flex flex-col">
            {/* Atmospheric Layers */}
            <div className="fixed inset-0 z-0 opacity-40">
              <ShootingStars />
            </div>
            <div className="crt-overlay" />
            <div className="vhs-rainbow-strip fixed top-0 left-0 right-0 z-[60]" />

            {/* Domain routing for sacred path configuration */}
            <DomainRouting>
              {/* Main content wrapper */}
              <div className="relative z-10 flex flex-1 flex-col">
                {children}
              </div>
            </DomainRouting>
          </div>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
