"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader, ImagePlus, CheckCircle, AlertCircle, Save } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  id: string
  url: string
  blurHash: string | null
  alt: string | null
  sortOrder: number
  isPrimary: boolean
}

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  comparePrice: number | null
  stock: number
  reservedStock: number
  weight: number | null
  isActive: boolean
}

interface Category {
  id: string
  name: string
}

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  ingredients: string | null
  howToUse: string | null
  brandName: string
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  category: Category
  variants: ProductVariant[]
  images: ProductImage[]
}

interface VariantSaveState {
  saving: boolean
  success: boolean
  error: string | null
}

// ─── Variant row ──────────────────────────────────────────────────────────────

interface VariantRowProps {
  variant: ProductVariant
  productId: string
  onUpdated: (updated: ProductVariant) => void
}

function VariantRow({ variant, productId, onUpdated }: Readonly<VariantRowProps>) {
  const [price, setPrice] = useState(String(variant.price))
  const [comparePrice, setComparePrice] = useState(
    variant.comparePrice != null ? String(variant.comparePrice) : ""
  )
  const [stock, setStock] = useState(String(variant.stock))
  const [isActive, setIsActive] = useState(variant.isActive)
  const [state, setState] = useState<VariantSaveState>({
    saving: false,
    success: false,
    error: null,
  })

  async function handleSave() {
    setState({ saving: true, success: false, error: null })

    const parsedPrice = parseInt(price, 10)
    const parsedStock = parseInt(stock, 10)

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setState({ saving: false, success: false, error: "Prix invalide" })
      return
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      setState({ saving: false, success: false, error: "Stock invalide" })
      return
    }

    const parsedCompare = comparePrice ? parseInt(comparePrice, 10) : undefined
    if (comparePrice && (isNaN(parsedCompare!) || parsedCompare! <= 0)) {
      setState({ saving: false, success: false, error: "Prix barré invalide" })
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant.id,
          price: parsedPrice,
          stock: parsedStock,
          comparePrice: parsedCompare ?? null,
          isActive,
        }),
      })

      if (res.ok) {
        const data = await res.json() as { variant: ProductVariant }
        onUpdated(data.variant)
        setState({ saving: false, success: true, error: null })
        setTimeout(() => setState((s) => ({ ...s, success: false })), 2500)
      } else {
        const data = await res.json() as { error?: string }
        setState({ saving: false, success: false, error: data.error ?? "Erreur" })
      }
    } catch {
      setState({ saving: false, success: false, error: "Erreur réseau" })
    }
  }

  return (
    <tr className="border-b border-creme last:border-0">
      <td className="py-3 pr-4">
        <p className="text-sm font-medium text-ebene">{variant.name}</p>
        <p className="font-mono text-xs text-taupe">{variant.sku}</p>
      </td>
      <td className="py-3 pr-3">
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input-field w-28"
          aria-label="Prix FCFA"
        />
      </td>
      <td className="py-3 pr-3">
        <input
          type="number"
          min="1"
          value={comparePrice}
          onChange={(e) => setComparePrice(e.target.value)}
          className="input-field w-28"
          placeholder="—"
          aria-label="Prix barré FCFA"
        />
      </td>
      <td className="py-3 pr-3">
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="input-field w-20"
          aria-label="Stock"
        />
      </td>
      <td className="py-3 pr-3 text-xs text-taupe">
        {variant.reservedStock > 0 ? `${variant.reservedStock} réservé` : "—"}
      </td>
      <td className="py-3 pr-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-taupe/30 text-or"
          />
          <span className="text-xs text-taupe">{isActive ? "Actif" : "Inactif"}</span>
        </label>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={state.saving}
            className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10 disabled:opacity-50"
          >
            {state.saving ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Sauver
          </button>
          {state.success && (
            <CheckCircle size={14} className="text-green-500" aria-label="Sauvegardé" />
          )}
          {state.error && (
            <span className="text-xs text-red-500">{state.error}</span>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Image uploader ───────────────────────────────────────────────────────────

interface ImageUploaderProps {
  productId: string
  productSlug: string
  onUploaded: (image: ProductImage) => void
}

function ImageUploader({ productId, productSlug, onUploaded }: Readonly<ImageUploaderProps>) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setError(null)

    if (!selected) {
      setFile(null)
      setPreview(null)
      return
    }

    setFile(selected)
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") setPreview(reader.result)
    }
    reader.readAsDataURL(selected)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("productSlug", productSlug)

    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json() as { url: string; blurHash: string }

        // Save image record to product
        const saveRes = await fetch(`/api/admin/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.url, blurHash: data.blurHash }),
        })

        if (saveRes.ok) {
          const saved = await saveRes.json() as { image: ProductImage }
          onUploaded(saved.image)
          setFile(null)
          setPreview(null)
        } else {
          setError("Image uploadée mais non sauvegardée")
        }
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Erreur upload")
      }
    } catch {
      setError("Erreur réseau")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Choisir une image</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="block w-full text-xs text-taupe file:mr-3 file:rounded-md file:border file:border-or/40 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brun hover:file:bg-or/10"
        />
      </label>

      {preview && (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Aperçu"
            className="h-20 w-20 rounded-lg object-cover border border-creme"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-md border border-or/40 px-3 py-1.5 text-xs font-medium text-brun hover:bg-or/10 disabled:opacity-50"
          >
            {uploading ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <ImagePlus size={12} />
            )}
            {uploading ? "Upload…" : "Uploader"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)

  // Info form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [howToUse, setHowToUse] = useState("")
  const [brandName, setBrandName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`)
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setLoadError(data.error ?? "Produit introuvable")
        return
      }
      const data = await res.json() as { product: ProductDetail; orderCount: number }
      setProduct(data.product)
      setOrderCount(data.orderCount)

      // Populate form fields
      setName(data.product.name)
      setDescription(data.product.description)
      setIngredients(data.product.ingredients ?? "")
      setHowToUse(data.product.howToUse ?? "")
      setBrandName(data.product.brandName)
      setCategoryId(data.product.categoryId)
      setIsActive(data.product.isActive)
      setIsFeatured(data.product.isFeatured)
    } catch {
      setLoadError("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadProduct()
  }, [loadProduct])

  async function loadCategories() {
    if (categoriesLoaded) return
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json() as { categories: Category[] }
        setCategories(data.categories)
      }
    } catch {
      // Non-blocking — categories will remain empty
    }
    setCategoriesLoaded(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          description: description.trim() || undefined,
          ingredients: ingredients.trim() || undefined,
          howToUse: howToUse.trim() || undefined,
          brandName: brandName.trim() || undefined,
          categoryId: categoryId || undefined,
          isActive,
          isFeatured,
        }),
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        const data = await res.json() as { error?: string }
        setSaveError(data.error ?? "Erreur lors de la sauvegarde")
      }
    } catch {
      setSaveError("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Désactiver ce produit ? (soft delete — les commandes sont préservées)")) return
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        const data = await res.json() as { error?: string }
        setDeleteError(data.error ?? "Erreur lors de la suppression")
      }
    } catch {
      setDeleteError("Erreur réseau")
    } finally {
      setDeleting(false)
    }
  }

  function handleVariantUpdated(updated: ProductVariant) {
    setProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        variants: prev.variants.map((v) => (v.id === updated.id ? updated : v)),
      }
    })
  }

  function handleImageUploaded(image: ProductImage) {
    setProduct((prev) => {
      if (!prev) return prev
      return { ...prev, images: [...prev.images, image] }
    })
  }

  // ─── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-or" />
      </div>
    )
  }

  if (loadError || !product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        <AlertCircle size={16} className="mb-2" />
        {loadError ?? "Produit introuvable"}
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 text-xs text-taupe hover:text-brun"
          >
            <ArrowLeft size={14} />
            Produits
          </Link>
          <span className="text-xs text-taupe/50">/</span>
          <span className="truncate text-sm text-ebene">{product.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold text-ebene">
            Modifier : {product.name}
          </h1>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={14} />
                Sauvegardé
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-500">{saveError}</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left column (2/3) ─────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Informations */}
          <fieldset className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <legend className="mb-4 text-sm font-semibold text-ebene">Informations</legend>
            <div className="space-y-4">

              <div>
                <label htmlFor="edit-name" className="mb-1 block text-xs font-medium text-taupe">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-taupe">
                  Slug (URL)
                </label>
                <input
                  value={product.slug}
                  readOnly
                  className="input-field w-full cursor-not-allowed font-mono text-sm opacity-60"
                  aria-label="Slug (lecture seule)"
                />
                <p className="mt-1 text-xs text-taupe/60">
                  Le slug ne peut pas être modifié après création.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-category" className="mb-1 block text-xs font-medium text-taupe">
                    Catégorie
                  </label>
                  <select
                    id="edit-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    onFocus={loadCategories}
                    className="input-field w-full"
                  >
                    <option value={product.category.id}>{product.category.name}</option>
                    {categories
                      .filter((c) => c.id !== product.category.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-brand" className="mb-1 block text-xs font-medium text-taupe">
                    Marque
                  </label>
                  <input
                    id="edit-brand"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="input-field w-full"
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-description" className="mb-1 block text-xs font-medium text-taupe">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label htmlFor="edit-ingredients" className="mb-1 block text-xs font-medium text-taupe">
                  Ingrédients
                </label>
                <textarea
                  id="edit-ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Aqua, Glycerin…"
                />
              </div>

              <div>
                <label htmlFor="edit-how-to-use" className="mb-1 block text-xs font-medium text-taupe">
                  Mode d&apos;emploi
                </label>
                <textarea
                  id="edit-how-to-use"
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
          <section className="rounded-xl border border-or-light bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-ebene">
              Variantes ({product.variants.length})
            </h2>

            {product.variants.length === 0 ? (
              <p className="text-sm text-taupe">Aucune variante.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-creme">
                      {["Variante", "Prix (FCFA)", "Prix barré", "Stock", "Réservé", "Statut", ""].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="pb-2 pr-4 text-left text-xs font-semibold text-taupe"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <VariantRow
                        key={variant.id}
                        variant={variant}
                        productId={product.id}
                        onUpdated={handleVariantUpdated}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ── Right column (1/3) ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Images */}
          <section className="rounded-xl border border-or-light bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-ebene">Images</h2>

            {product.images.length > 0 ? (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {product.images.map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? product.name}
                      className="h-20 w-full rounded-lg object-cover border border-creme"
                    />
                    {img.isPrimary && (
                      <span className="absolute bottom-1 left-1 rounded bg-or px-1 py-0.5 text-[10px] font-semibold text-white">
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-xs text-taupe">Aucune image.</p>
            )}

            <ImageUploader
              productId={product.id}
              productSlug={product.slug}
              onUploaded={handleImageUploaded}
            />
          </section>

          {/* Statut */}
          <section className="rounded-xl border border-or-light bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-ebene">Statut</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-taupe/30 text-or"
                />
                <div>
                  <span className="text-sm text-ebene">Produit actif</span>
                  <p className="text-xs text-taupe">Visible dans le catalogue</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-taupe/30 text-or"
                />
                <div>
                  <span className="text-sm text-ebene">Mis en avant</span>
                  <p className="text-xs text-taupe">Affiché sur la page d&apos;accueil</p>
                </div>
              </label>
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-red-600">Zone dangereuse</h2>

            {orderCount > 0 ? (
              <p className="text-xs text-taupe">
                Ce produit a {orderCount} commande{orderCount > 1 ? "s" : ""} associée
                {orderCount > 1 ? "s" : ""}. La suppression est désactivée.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-taupe">
                  Désactive le produit (soft delete). L&apos;action est réversible.
                </p>
                {deleteError && (
                  <p className="mb-2 text-xs text-red-500">{deleteError}</p>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting && <Loader size={14} className="animate-spin" />}
                  {deleting ? "Suppression…" : "Désactiver le produit"}
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
