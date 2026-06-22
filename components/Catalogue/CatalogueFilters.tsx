"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { ArrowUpDown } from "lucide-react"

const SORT_OPTIONS = [
  { value: "newest",     label: "Nouveautés" },
  { value: "price-asc",  label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "popular",    label: "Populaires" },
] as const

interface CatalogueFiltersProps {
  total: number
  categoryName: string
}

export default function CatalogueFilters({ total, categoryName }: Readonly<CatalogueFiltersProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get("sort") ?? "newest"
  const currentSearch = searchParams.get("q") ?? ""

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Infos */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ebene md:text-3xl">
          {categoryName}
        </h1>
        <p className="mt-1 text-sm text-taupe">
          {total} produit{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        {/* Recherche */}
        <form
          role="search"
          className="relative flex items-center rounded-full border border-or/25 bg-white transition-shadow focus-within:border-or/50 focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.1)]"
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.querySelector("input")
            if (input) updateParam("q", input.value)
          }}
        >
          <span className="pointer-events-none pl-3 text-taupe/50" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            defaultValue={currentSearch}
            placeholder="Rechercher..."
            aria-label="Rechercher dans cette catégorie"
            className="w-36 bg-transparent py-2 pl-2 pr-1 text-sm text-ebene placeholder:text-taupe/40 outline-none sm:w-44"
          />
          <button
            type="submit"
            className="m-0.5 rounded-full bg-or/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-brun transition-colors hover:bg-or hover:text-ebene"
            aria-label="Lancer la recherche"
          >
            OK
          </button>
        </form>

        {/* Tri */}
        <div className="relative flex items-center gap-1.5">
          <ArrowUpDown size={14} className="shrink-0 text-taupe" aria-hidden="true" />
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            aria-label="Trier les produits"
            className="appearance-none rounded-full border border-or-light bg-white py-2 pl-3 pr-7 text-sm text-ebene focus:border-or focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-taupe"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
