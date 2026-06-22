import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter, DM_Mono } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import { Analytics } from "@vercel/analytics/next"

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Ka Cosmetic — La fée de la perfection",
    template: "%s — Ka Cosmetic",
  },
  description:
    "Ka Cosmetic — Cosmétiques premium pour peaux noires et métissées. Soins visage, corps, maquillage & parfums livrés J0/J+1 à Abidjan. Paiement Wave, Orange Money, Visa.",
  keywords: ["cosmétiques", "beauté africaine", "luxe", "Abidjan", "Côte d'Ivoire", "soin visage", "peau noire", "Wave", "Orange Money"],
  authors: [{ name: "Ka Cosmetic" }],
  creator: "Ka Cosmetic",
  metadataBase: new URL("https://kacosmetic.ci"),
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://kacosmetic.ci",
    siteName: "Ka Cosmetic",
    title: "Ka Cosmetic — La fée de la perfection",
    description: "Boutique de cosmétiques luxe à Abidjan. Livraison même jour.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Ka Cosmetic" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ka Cosmetic",
    description: "Boutique de cosmétiques luxe à Abidjan.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#1A0A00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable} ${dmMono.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
