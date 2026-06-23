"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Loader, ImagePlus, X } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface VariantForm {
  id: string
  name: string
  sku: string
  price: string
  comparePrice: string
  stock: string
  weight: string
}

interface PendingImage {
  id: string
  file: File
  preview: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function skuFromName(name: string, index: number) {
  const prefix = name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 8)
  return prefix ? `KA-${prefix}-${String(index + 1).padStart(3, "0")}` : ""
}

function discount(price: string, compare: string) {
  const p = parseInt(price, 10)
  const c = parseInt(compare, 10)
  if (!p || !c || c <= p) return null
  return Math.round((1 - p / c) * 100)
}

function newVariant(productName = "", index = 0): VariantForm {
  return {
    id: crypto.randomUUID(),
    name: "",
    sku: skuFromName(productName, index),
    price: "",
    comparePrice: "",
    stock: "0",
    weight: "",
  }
}

function inputCls(hasError = false) {
  return `input-field w-full ${hasError ? "border-red-400 focus:ring-red-300" : ""}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNewProductPage() {
  const router = useRouter()

  // Infos générales
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [howToUse, setHowToUse] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [brandName, setBrandName] = useState("Ka Cosmetic")
  const [isFeatured, setIsFeatured] = useState(false)

  // Variantes
  const [variants, setVariants] = useState<VariantForm[]>([newVariant()])

  // Images en attente d'upload
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Soumission
  const [submitting, setSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState<"idle" | "creating" | "uploading" | "done">("idle")
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Charger les catégories au montage
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.ok ? r.json() : null)
      .then((data: { categories: Array<{ id: string; name: string }> } | null) => {
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  // ── Nom → slug auto
  function handleNameChange(v: string) {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
    // Mettre à jour les SKUs des variantes sans SKU manuel
    setVariants(prev => prev.map((vr, i) =>
      vr.sku === skuFromName(name, i) || vr.sku === ""
        ? { ...vr, sku: skuFromName(v, i) }
        : vr
    ))
  }

  // ── Variantes
  function addVariant() {
    setVariants(prev => [...prev, newVariant(name, prev.length)])
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  function updateVariant(id: string, field: keyof Omit<VariantForm, "id">, value: string) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  // ── Images
  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages: PendingImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }))
    setPendingImages(prev => [...prev, ...newImages])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removePendingImage(id: string) {
    setPendingImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  // ── Validation
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Le nom est requis"
    if (!slug.trim()) e.slug = "Le slug est requis"
    if (!description.trim()) e.description = "La description est requise"
    if (!categoryId) e.categoryId = "La catégorie est requise"

    variants.forEach((v, i) => {
      if (!v.name.trim()) e[`v_${i}_name`] = "Nom requis"
      if (!v.sku.trim()) e[`v_${i}_sku`] = "SKU requis"
      const price = parseInt(v.price, 10)
      if (isNaN(price) || price <= 0) e[`v_${i}_price`] = "Prix invalide"
      const stock = parseInt(v.stock, 10)
      if (isNaN(stock) || stock < 0) e[`v_${i}_stock`] = "Stock invalide"
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Soumission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      // Scroll vers la première erreur
      const firstError = document.querySelector("[data-error]")
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setSubmitting(true)
    setSubmitStep("creating")

    try {
      // 1. Créer le produit
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        ingredients: ingredients.trim() || undefined,
        howToUse: howToUse.trim() || undefined,
        categoryId,
        brandName: brandName.trim() || "Ka Cosmetic",
        isFeatured,
        variants: variants.map(v => ({
          name: v.name.trim(),
          sku: v.sku.trim().toUpperCase(),
          price: parseInt(v.price, 10),
          comparePrice: v.comparePrice ? parseInt(v.comparePrice, 10) : undefined,
          stock: parseInt(v.stock, 10),
          weight: v.weight ? parseInt(v.weight, 10) : undefined,
        })),
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setErrors({ form: data.error ?? "Erreur lors de la création" })
        return
      }

      const { product } = await res.json() as { product: { id: string; slug: string } }

      // 2. Uploader les images en attente
      if (pendingImages.length > 0) {
        setSubmitStep("uploading")
        setUploadProgress({ done: 0, total: pendingImages.length })

        for (const img of pendingImages) {
          const fd = new FormData()
          fd.append("file", img.file)
          fd.append("productSlug", product.slug)

          try {
            const uploadRes = await fetch("/api/admin/images", { method: "POST", body: fd })
            if (uploadRes.ok) {
              const { url, blurHash } = await uploadRes.json() as { url: string; blurHash: string }
              await fetch(`/api/admin/products/${product.id}/images`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, blurHash }),
              })
            }
          } catch {
            // Image upload échouée — ne bloque pas la création
          }

          setUploadProgress(prev => ({ ...prev, done: prev.done + 1 }))
        }
      }

      setSubmitStep("done")
      router.push(`/admin/products/${product.id}`)
      router.refresh()
    } catch {
      setErrors({ form: "Erreur réseau. Réessayez." })
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel =
    submitStep === "creating" ? "Création du produit…"
    : submitStep === "uploading" ? `Upload images (${uploadProgress.done}/${uploadProgress.total})…`
    : submitStep === "done" ? "Redirection…"
    : "Créer le produit"

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="flex items-center gap-1.5 text-xs text-taupe hover:text-brun">
          <ArrowLeft size={14} /> Produits
        </Link>
        <span className="text-xs text-taupe/50">/</span>
        <span className="text-sm text-ebene">Nouveau produit</span>
      </div>

      <h1 className="font-display mb-6 text-2xl font-semibold text-ebene">Créer un produit</h1>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Colonne principale ──────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Informations générales */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <legend className="mb-4 text-sm font-semibold text-ebene">Informations générales</legend>
            <div className="space-y-4">

              <div data-error={errors.name ? "1" : undefined}>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="name">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input id="name" value={name} onChange={e => handleNameChange(e.target.value)}
                  className={inputCls(!!errors.name)} placeholder="Ex : Sérum Éclat Doré" maxLength={200} />
                <div className="mt-0.5 flex items-center justify-between">
                  {errors.name
                    ? <p className="text-xs text-red-500">{errors.name}</p>
                    : <span />}
                  <span className="text-[10px] text-taupe/50">{name.length}/200</span>
                </div>
              </div>

              <div data-error={errors.slug ? "1" : undefined}>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="slug">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-md border border-or-light bg-creme/40 px-3 py-2 text-xs text-taupe/60">
                  <span className="mr-1 shrink-0">/produit/</span>
                  <input id="slug" value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ebene outline-none"
                    placeholder="serum-eclat-dore" maxLength={200} />
                </div>
                {errors.slug && <p className="mt-0.5 text-xs text-red-500">{errors.slug}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div data-error={errors.categoryId ? "1" : undefined}>
                  <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="categoryId">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select id="categoryId" value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className={inputCls(!!errors.categoryId)}>
                    <option value="">Sélectionner…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="mt-0.5 text-xs text-red-500">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="brandName">Marque</label>
                  <input id="brandName" value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="input-field w-full" maxLength={100} />
                </div>
              </div>

              <div data-error={errors.description ? "1" : undefined}>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea id="description" value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4} className={inputCls(!!errors.description)}
                  placeholder="Description du produit…" />
                <div className="mt-0.5 flex items-center justify-between">
                  {errors.description
                    ? <p className="text-xs text-red-500">{errors.description}</p>
                    : <span />}
                  <span className="text-[10px] text-taupe/50">{description.length} car.</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="ingredients">Ingrédients</label>
                <textarea id="ingredients" value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  rows={3} className="input-field w-full"
                  placeholder="Aqua, Glycerin, Niacinamide…" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="howToUse">Mode d&apos;emploi</label>
                <textarea id="howToUse" value={howToUse}
                  onChange={e => setHowToUse(e.target.value)}
                  rows={3} className="input-field w-full"
                  placeholder="Appliquer matin et soir sur peau propre…" />
              </div>

            </div>
          </fieldset>

          {/* Variantes */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <legend className="text-sm font-semibold text-ebene">Variantes ({variants.length})</legend>
              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10">
                <Plus size={12} /> Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((v, i) => {
                const pct = discount(v.price, v.comparePrice)
                return (
                  <div key={v.id} className="rounded-lg border border-creme p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-taupe">Variante {i + 1}</p>
                        {pct && (
                          <span className="rounded-full bg-or/15 px-2 py-0.5 text-[10px] font-bold text-brun">
                            –{pct}%
                          </span>
                        )}
                      </div>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(v.id)}
                          className="text-red-400 hover:text-red-600" aria-label="Supprimer la variante">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs text-taupe">Nom <span className="text-red-500">*</span></label>
                        <input value={v.name}
                          onChange={e => updateVariant(v.id, "name", e.target.value)}
                          className={inputCls(!!errors[`v_${i}_name`])}
                          placeholder="50ml, Taille S…" maxLength={100} />
                        {errors[`v_${i}_name`] && <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_name`]}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-taupe">SKU <span className="text-red-500">*</span></label>
                        <input value={v.sku}
                          onChange={e => updateVariant(v.id, "sku", e.target.value.toUpperCase())}
                          className={`${inputCls(!!errors[`v_${i}_sku`])} font-mono text-sm`}
                          placeholder="KA-SER-001" maxLength={50} />
                        {errors[`v_${i}_sku`] && <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_sku`]}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-taupe">Prix (FCFA) <span className="text-red-500">*</span></label>
                        <input type="number" min="0" value={v.price}
                          onChange={e => updateVariant(v.id, "price", e.target.value)}
                          className={inputCls(!!errors[`v_${i}_price`])}
                          placeholder="12000" />
                        {errors[`v_${i}_price`] && <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_price`]}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-taupe">
                          Prix barré (FCFA)
                          {v.comparePrice && parseInt(v.comparePrice) <= parseInt(v.price || "0") && (
                            <span className="ml-1 text-red-400">doit être &gt; prix</span>
                          )}
                        </label>
                        <input type="number" min="0" value={v.comparePrice}
                          onChange={e => updateVariant(v.id, "comparePrice", e.target.value)}
                          className="input-field w-full" placeholder="15000" />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-taupe">Stock <span className="text-red-500">*</span></label>
                        <input type="number" min="0" value={v.stock}
                          onChange={e => updateVariant(v.id, "stock", e.target.value)}
                          className={inputCls(!!errors[`v_${i}_stock`])}
                          placeholder="0" />
                        {errors[`v_${i}_stock`] && <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_stock`]}</p>}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-taupe">Poids (g)</label>
                        <input type="number" min="0" value={v.weight}
                          onChange={e => updateVariant(v.id, "weight", e.target.value)}
                          className="input-field w-full" placeholder="100" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </fieldset>

          {/* Images */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <legend className="text-sm font-semibold text-ebene">
                Images {pendingImages.length > 0 && <span className="text-taupe">({pendingImages.length})</span>}
              </legend>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10">
                <ImagePlus size={12} /> Ajouter des photos
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                onChange={handleFilesSelected} className="hidden" />
            </div>

            {pendingImages.length === 0 ? (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-or/30 bg-creme/30 py-10 text-center transition-colors hover:border-or/60 hover:bg-or/5">
                <ImagePlus size={28} className="text-or/50" />
                <div>
                  <p className="text-sm font-medium text-ebene">Cliquez pour ajouter des photos</p>
                  <p className="mt-0.5 text-xs text-taupe">JPG, PNG, WebP — max 5 Mo par image</p>
                </div>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {pendingImages.map((img, i) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-creme">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-or px-1.5 py-0.5 text-[9px] font-bold uppercase text-ebene">
                        Principale
                      </span>
                    )}
                    <button type="button" onClick={() => removePendingImage(img.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-or/30 bg-creme/30 text-or/50 transition-colors hover:border-or/60 hover:bg-or/5">
                  <Plus size={20} />
                </button>
              </div>
            )}
            <p className="mt-2 text-[11px] text-taupe/60">
              La première image sera utilisée comme image principale dans le catalogue.
            </p>
          </fieldset>

        </div>

        {/* ── Colonne latérale ──────────────────────────────────── */}
        <div className="space-y-4">

          {/* Publication */}
          <div className="rounded-xl border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-ebene">Publication</p>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-creme/60">
              <input type="checkbox" checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-taupe/30 text-or" />
              <div>
                <span className="block text-sm font-medium text-ebene">Produit mis en avant</span>
                <span className="text-xs text-taupe">Badge &ldquo;Nouveau&rdquo; sur la carte produit</span>
              </div>
            </label>

            <div className="mt-3 rounded-md bg-creme/50 px-3 py-2">
              <p className="text-xs text-taupe">
                ✓ Le produit sera <strong>actif et visible</strong> dans le catalogue dès la création.
              </p>
            </div>
          </div>

          {/* Résumé */}
          {name && (
            <div className="rounded-xl border border-or-light bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taupe">Aperçu</p>
              <p className="font-display text-base font-semibold text-ebene">{name}</p>
              {slug && <p className="mt-0.5 font-mono text-[10px] text-taupe/60">/produit/{slug}</p>}
              {categoryId && categories.find(c => c.id === categoryId) && (
                <p className="mt-1 text-xs text-or">
                  {categories.find(c => c.id === categoryId)?.name}
                </p>
              )}
              {variants[0]?.price && (
                <p className="mt-2 font-mono text-sm font-bold text-ebene">
                  {parseInt(variants[0].price).toLocaleString("fr-CI")} FCFA
                  {variants[0].comparePrice && parseInt(variants[0].comparePrice) > parseInt(variants[0].price) && (
                    <span className="ml-2 text-xs text-taupe/60 line-through">
                      {parseInt(variants[0].comparePrice).toLocaleString("fr-CI")} FCFA
                    </span>
                  )}
                </p>
              )}
              {pendingImages.length > 0 && (
                <p className="mt-2 text-xs text-taupe">{pendingImages.length} image{pendingImages.length > 1 ? "s" : ""} sélectionnée{pendingImages.length > 1 ? "s" : ""}</p>
              )}
            </div>
          )}

          {/* Erreur globale */}
          {errors.form && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errors.form}
            </div>
          )}

          {/* Erreurs de validation */}
          {Object.keys(errors).filter(k => k !== "form").length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 text-xs font-semibold text-amber-700">Champs manquants :</p>
              <ul className="space-y-0.5">
                {Object.values(errors).map((msg, i) => (
                  <li key={i} className="text-xs text-amber-600">• {msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bouton créer */}
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin" />
                {submitLabel}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Créer le produit
                {pendingImages.length > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                    + {pendingImages.length} photo{pendingImages.length > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            )}
          </button>

          <Link href="/admin/products"
            className="block w-full rounded-lg border border-or-light py-2.5 text-center text-sm text-taupe hover:bg-creme">
            Annuler
          </Link>

        </div>
      </form>
    </div>
  )
}
