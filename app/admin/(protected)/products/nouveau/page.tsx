"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Loader } from "lucide-react"

interface VariantForm {
  id: string
  name: string
  sku: string
  price: string
  comparePrice: string
  stock: string
  weight: string
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function newVariant(): VariantForm {
  return { id: crypto.randomUUID(), name: "", sku: "", price: "", comparePrice: "", stock: "0", weight: "" }
}

export default function AdminNewProductPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [howToUse, setHowToUse] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [brandName, setBrandName] = useState("Ka Cosmetic")
  const [isFeatured, setIsFeatured] = useState(false)
  const [variants, setVariants] = useState<VariantForm[]>([newVariant()])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Charger les catégories au focus du champ
  async function loadCategories() {
    if (categoriesLoaded) return
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json() as { categories: Array<{ id: string; name: string }> }
        setCategories(data.categories)
      }
    } catch {
      // silently fail
    }
    setCategoriesLoaded(true)
  }

  function handleNameChange(v: string) {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  function addVariant() {
    setVariants((prev) => [...prev, newVariant()])
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  function updateVariant(id: string, field: keyof Omit<VariantForm, "id">, value: string) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    )
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        ingredients: ingredients.trim() || undefined,
        howToUse: howToUse.trim() || undefined,
        categoryId,
        brandName: brandName.trim() || "Ka Cosmetic",
        isFeatured,
        variants: variants.map((v) => ({
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

      if (res.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        const data = await res.json() as { error?: string }
        setErrors({ form: data.error ?? "Erreur lors de la création" })
      }
    } catch {
      setErrors({ form: "Erreur réseau. Réessayez." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="flex items-center gap-1.5 text-xs text-taupe hover:text-brun">
          <ArrowLeft size={14} />
          Produits
        </Link>
        <span className="text-xs text-taupe/50">/</span>
        <span className="text-sm text-ebene">Nouveau produit</span>
      </div>

      <h1 className="font-display mb-6 text-2xl font-semibold text-ebene">Créer un produit</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">

          {/* Informations générales */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <legend className="mb-4 text-sm font-semibold text-ebene">Informations générales</legend>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="name">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ex : Sérum Éclat Doré"
                  maxLength={200}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="slug">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                  className="input-field w-full font-mono text-sm"
                  placeholder="serum-eclat-dore"
                  maxLength={200}
                />
                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="categoryId">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    onFocus={loadCategories}
                    className="input-field w-full"
                  >
                    <option value="">Sélectionner…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="brandName">
                    Marque
                  </label>
                  <input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="input-field w-full"
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Description du produit…"
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="ingredients">
                  Ingrédients
                </label>
                <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Aqua, Glycerin, Niacinamide…"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe" htmlFor="howToUse">
                  Mode d&apos;emploi
                </label>
                <textarea
                  id="howToUse"
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Appliquer matin et soir…"
                />
              </div>
            </div>
          </fieldset>

          {/* Variantes */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <legend className="text-sm font-semibold text-ebene">
                Variantes ({variants.length})
              </legend>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10"
              >
                <Plus size={12} />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={v.id} className="rounded-lg border border-creme p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-taupe">Variante {i + 1}</p>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        className="text-red-400 hover:text-red-600"
                        aria-label="Supprimer la variante"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-taupe">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={v.name}
                        onChange={(e) => updateVariant(v.id, "name", e.target.value)}
                        className="input-field w-full"
                        placeholder="50ml, Rouge, S…"
                        maxLength={100}
                      />
                      {errors[`v_${i}_name`] && (
                        <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_name`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-taupe">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, "sku", e.target.value.toUpperCase())}
                        className="input-field w-full font-mono text-sm"
                        placeholder="KA-SER-001"
                        maxLength={50}
                      />
                      {errors[`v_${i}_sku`] && (
                        <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_sku`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-taupe">
                        Prix (FCFA) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, "price", e.target.value)}
                        className="input-field w-full"
                        placeholder="12000"
                      />
                      {errors[`v_${i}_price`] && (
                        <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_price`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-taupe">Prix barré (FCFA)</label>
                      <input
                        type="number"
                        min="0"
                        value={v.comparePrice}
                        onChange={(e) => updateVariant(v.id, "comparePrice", e.target.value)}
                        className="input-field w-full"
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-taupe">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                        className="input-field w-full"
                        placeholder="0"
                      />
                      {errors[`v_${i}_stock`] && (
                        <p className="mt-0.5 text-xs text-red-500">{errors[`v_${i}_stock`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-taupe">Poids (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={v.weight}
                        onChange={(e) => updateVariant(v.id, "weight", e.target.value)}
                        className="input-field w-full"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <div className="rounded-xl border border-or-light bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-ebene">Publication</p>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-taupe/30 text-or"
              />
              <span className="text-sm text-ebene">Produit mis en avant</span>
            </label>
            <p className="mt-2 text-xs text-taupe">
              Le produit sera actif et visible dans le catalogue dès la création.
            </p>
          </div>

          {errors.form && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errors.form}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin" />
                Création en cours…
              </span>
            ) : (
              "Créer le produit"
            )}
          </button>

          <Link
            href="/admin/products"
            className="block w-full rounded-lg border border-or-light py-2.5 text-center text-sm text-taupe hover:bg-creme"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
