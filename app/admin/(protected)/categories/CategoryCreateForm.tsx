"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

const inputCls = "rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 w-full"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export default function CategoryCreateForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "creating" | "uploading" | "error">("idle")
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState("0")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim()) { setError("Le nom est obligatoire."); return }

    const finalSlug = slug.trim() || slugify(name.trim())

    setStatus("creating")
    try {
      // 1. Create category
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim() || undefined,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      })
      const data = await res.json() as { category?: { id: string }; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création.")
        setStatus("idle")
        return
      }

      const categoryId = data.category!.id

      // 2. Upload image if selected
      const file = fileRef.current?.files?.[0]
      if (file) {
        setStatus("uploading")
        const fd = new FormData()
        fd.append("file", file)
        await fetch(`/api/admin/categories/${categoryId}/image`, { method: "POST", body: fd })
      }

      // 3. Reset and refresh
      setName(""); setSlug(""); setDescription(""); setSortOrder("0"); setPreview(null)
      if (fileRef.current) fileRef.current.value = ""
      setStatus("idle")
      router.refresh()
    } catch {
      setError("Erreur réseau.")
      setStatus("idle")
    }
  }

  const busy = status === "creating" || status === "uploading"

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {/* Nom */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-taupe">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={100}
          placeholder="Soins du visage"
          value={name}
          onChange={e => { setName(e.target.value); if (!slug) setSlug("") }}
          className={inputCls}
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-taupe">
          Slug <span className="font-normal normal-case text-taupe/60">(auto si vide)</span>
        </label>
        <input
          type="text"
          maxLength={100}
          placeholder={name ? slugify(name) : "soins-du-visage"}
          value={slug}
          onChange={e => setSlug(e.target.value)}
          pattern="^[a-z0-9-]+$"
          className={`${inputCls} font-mono`}
        />
      </div>

      {/* Ordre */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wider text-taupe">
          Ordre d&apos;affichage
        </label>
        <input
          type="number"
          min={0}
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Image */}
      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
        <label className="text-xs font-medium uppercase tracking-wider text-taupe">
          Image <span className="font-normal normal-case text-taupe/60">(menu navigation)</span>
        </label>
        <div className="flex items-start gap-4">
          <div>
            <label
              htmlFor="cat-image"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-taupe transition-colors hover:border-[#C9A84C] hover:text-ebene"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {preview ? "Changer…" : "Choisir un fichier"}
            </label>
            <input
              id="cat-image"
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-1 text-[11px] text-taupe/60">JPEG, PNG, WebP · max 5 Mo</p>
          </div>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Aperçu" className="h-20 w-20 rounded object-cover border border-or-light" />
          )}
        </div>
      </div>

      {/* Sous-catégories */}
      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
        <label className="text-xs font-medium uppercase tracking-wider text-taupe">
          Sous-catégories <span className="font-normal normal-case text-taupe/60">(séparées par |)</span>
        </label>
        <textarea
          rows={2}
          maxLength={500}
          placeholder="Éclat | Hydratation | Anti-âge | Nettoyant"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={inputCls}
        />
        <p className="text-[11px] text-taupe/60">
          Liens dans le mega-menu — ex&nbsp;: <code className="rounded bg-or-light/60 px-1">Éclat | Hydratation | Anti-âge</code>
        </p>
      </div>

      {/* Submit + error */}
      <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#1A0A00] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "creating" ? "Création…" : status === "uploading" ? "Upload image…" : "Créer la catégorie"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

    </form>
  )
}
