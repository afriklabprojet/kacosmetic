"use client"

import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Search, X, Loader } from "lucide-react"

interface CatalogueSearchProps {
  defaultValue?: string
}

export default function CatalogueSearch({ defaultValue = "" }: Readonly<CatalogueSearchProps>) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    setLoading(true)
    if (q) {
      router.push(`/catalogue?q=${encodeURIComponent(q)}`)
    } else {
      router.push("/catalogue")
    }
  }

  function handleClear() {
    setValue("")
    inputRef.current?.focus()
    router.push("/catalogue")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full max-w-sm items-center gap-0 rounded-full border border-or/30 bg-white shadow-sm transition-shadow focus-within:border-or/60 focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
      role="search"
      aria-label="Rechercher un produit"
    >
      {/* Icône loupe */}
      <span className="pointer-events-none flex-shrink-0 pl-4 text-taupe/50" aria-hidden="true">
        <Search size={16} strokeWidth={1.8} />
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher un produit…"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-3 pl-3 pr-2 text-sm text-ebene placeholder:text-taupe/40 outline-none"
        aria-label="Mot-clé"
      />

      {/* Bouton effacer */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 p-2 text-taupe/40 transition-colors hover:text-taupe"
          aria-label="Effacer la recherche"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}

      {/* Bouton rechercher */}
      <button
        type="submit"
        disabled={loading}
        className="m-1 flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-brun px-4 text-[11px] font-semibold uppercase tracking-wider text-ivoire transition-colors hover:bg-brun-dark disabled:opacity-60"
        aria-label="Lancer la recherche"
      >
        {loading ? (
          <Loader size={14} className="animate-spin" />
        ) : (
          <>
            <Search size={13} strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">Chercher</span>
          </>
        )}
      </button>
    </form>
  )
}
