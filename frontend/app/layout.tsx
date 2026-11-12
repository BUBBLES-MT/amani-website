// frontend/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

// ============================================
// 🎯 METADATA KAMILI — SEO
// ============================================
export const metadata: Metadata = {
  // ✅ Jina halisi la kanisa
  title: {
    default: "KKKT Church - Usharika Wa Amani, Singida",
    template: "%s | KKKT Usharika Wa Amani, Singida",
  },
  description:
    "Kanisa la KKKT - Usharika Wa Amani, lililopo Singida-Ginery, Tanzania. Karibu ujiunge nasi kwa ibada, mahubiri, huduma za vijana, wanawake, waimbaji, na matukio mbalimbali ya kanisa.",

  // ✅ Keywords za local SEO
  keywords: [
    "KKKT Singida",
    "KKKT Usharika Wa Amani",
    "kanisa Singida",
    "kanisa la KKKT Singida",
    "Amani Luthelani Church",
    "church in Singida",
    "Lutheran church Tanzania",
    "ibada Singida",
    "mahubiri Singida",
    "kanisa la kilutheri Singida",
    "Singida Ginery church",
  ],

  // ✅ Waandishi
  authors: [{ name: "KKKT Usharika Wa Amani, Singida" }],
  creator: "KKKT Usharika Wa Amani, Singida",
  publisher: "KKKT Usharika Wa Amani, Singida",

  // ✅ Canonical URL — badilisha na domain yako halisi
  metadataBase: new URL("https://amanichurch.com"),
  alternates: {
    canonical: "/",
  },

  // ✅ Open Graph — kwa Facebook, WhatsApp, LinkedIn
  openGraph: {
    type: "website",
    locale: "sw_TZ",
    url: "https://amanichurch.com",
    siteName: "KKKT Church - Usharika Wa Amani, Singida",
    title: "KKKT Church - Usharika Wa Amani, Singida",
    description:
      "Kanisa la KKKT - Usharika Wa Amani, Singida-Ginery. Karibu kwa ibada, mahubiri, na huduma mbalimbali.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KKKT Church - Usharika Wa Amani, Singida",
      },
    ],
  },

  // ✅ Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "KKKT Church - Usharika Wa Amani, Singida",
    description:
      "Kanisa la KKKT - Usharika Wa Amani, Singida-Ginery. Karibu!",
    images: ["/og-image.jpg"],
  },

  // ✅ Robots — ruhusu Google na mitandao mingine
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // ✅ Verification (baadaye utaongeza code kutoka Google Search Console)
  verification: {
    // google: "your-google-verification-code",
  },

  // ✅ Aina ya app
  applicationName: "KKKT Usharika Wa Amani, Singida",
  category: "religion",

  // ✅ Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// ============================================
// 🎯 VIEWPORT
// ============================================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

// ============================================
// 🎯 STRUCTURED DATA (JSON-LD) — Church Schema
// ============================================
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: "KKKT Church - Usharika Wa Amani, Singida",
  alternateName: "Amani Luthelani Church",
  url: "https://amanichurch.com",
  logo: "https://amanichurch.com/logo.png",
  image: "https://amanichurch.com/og-image.jpg",
  description:
    "Kanisa la KKKT - Usharika Wa Amani, lililopo Singida-Ginery, Tanzania.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Singida-Ginery",
    addressLocality: "Singida",
    addressRegion: "Singida",
    addressCountry: "TZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -4.8167,
    longitude: 34.75,
  },
  telephone: "+255-XXX-XXX-XXX",
  email: "info@amanichurch.com",
  sameAs: [],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:00",
      closes: "12:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "17:00",
      closes: "19:00",
    },
  ],
};

// ============================================
// 🎯 ROOT LAYOUT
// ============================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw" suppressHydrationWarning>
      <head>
        {/* ✅ JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased bg-gray-50 min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}