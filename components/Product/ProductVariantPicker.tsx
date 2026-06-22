"use client"

import { useState } from "react"
import AddToCartButton from "./AddToCartButton"
import WishlistButton from "./WishlistButton"

interface Variant {
  id: string
  name: string
  price: number
  comparePrice: number | null
  stock: number
  reservedStock: number
}

interface ProductVariantPickerProps {
  productId: string
  productName: string
  variants: Variant[]
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default function ProductVariantPicker({
  productId,
  productName,
  variants,
}: Readonly<ProductVariantPickerProps>) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "")

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  const isInStock = selected ? selected.stock - selected.reservedStock > 0 : false

  return (
    <>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-ebene">
          {formatPrice(selected?.price ?? 0)}
        </span>
        {selected?.comparePrice && selected.comparePrice > (selected?.price ?? 0) && (
          <span className="text-base text-taupe line-through">
            {formatPrice(selected.comparePrice)}
          </span>
        )}
      </div>

      {variants.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-ebene">Format</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const inStock = v.stock - v.reservedStock > 0
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  disabled={!inStock}
                  className={`rounded-sm border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    v.id === selectedId
                      ? "border-or bg-creme text-ebene font-medium"
                      : "border-or-light text-ebene hover:border-or hover:bg-creme"
                  }`}
                >
                  {v.name}
                  {!inStock && <span className="ml-1 text-xs text-taupe">(épuisé)</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        {isInStock ? (
          <p className="flex items-center gap-1.5 text-sm text-succes">
            <span className="inline-block h-2 w-2 rounded-full bg-succes" aria-hidden />
            {" "}En stock — Livraison J0 ou J+1
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-erreur">
            <span className="inline-block h-2 w-2 rounded-full bg-erreur" aria-hidden />
            {" "}Temporairement épuisé
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <AddToCartButton
          variantId={selectedId}
          productName={productName}
          disabled={!isInStock}
        />
        <WishlistButton
          productId={productId}
          productName={productName}
          size={18}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-or/30 bg-white text-ebene/50 transition-colors hover:border-or hover:text-or"
        />
      </div>
    </>
  )
}
