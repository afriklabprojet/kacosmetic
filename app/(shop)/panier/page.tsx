import type { Metadata } from "next"
import CartPageClient from "@/components/Cart/CartPageClient"

export const metadata: Metadata = {
  title: "Panier — Ka Cosmetic",
  robots: { index: false },
}

export default function PanierPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-2xl font-semibold text-ebene md:text-3xl">
        Mon panier
      </h1>
      <CartPageClient />
    </div>
  )
}
