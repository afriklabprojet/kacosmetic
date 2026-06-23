import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SLUG_MAX_LENGTH = 100
const NAME_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 500
const SLUG_REGEX = /^[a-z0-9-]+$/

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryRow {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
  _count: { products: number }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createCategory(formData: FormData): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const rawName = formData.get("name")
  const rawSlug = formData.get("slug")
  const rawDescription = formData.get("description")
  const rawSortOrder = formData.get("sortOrder")

  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    throw new Error("Le nom est obligatoire.")
  }
  if (rawName.trim().length > NAME_MAX_LENGTH) {
    throw new Error(`Le nom ne peut pas dépasser ${NAME_MAX_LENGTH} caractères.`)
  }

  const name = rawName.trim()
  const slug =
    typeof rawSlug === "string" && rawSlug.trim().length > 0
      ? rawSlug.trim()
      : slugify(name)

  if (slug.length > SLUG_MAX_LENGTH || !SLUG_REGEX.test(slug)) {
    throw new Error(
      "Le slug ne peut contenir que des minuscules, chiffres et tirets (max 100 caractères)."
    )
  }

  const description =
    typeof rawDescription === "string" && rawDescription.trim().length > 0
      ? rawDescription.trim().slice(0, DESCRIPTION_MAX_LENGTH)
      : undefined

  const sortOrderRaw =
    typeof rawSortOrder === "string" ? parseInt(rawSortOrder, 10) : NaN
  const sortOrder = !isNaN(sortOrderRaw) && sortOrderRaw >= 0 ? sortOrderRaw : 0

  try {
    await prisma.category.create({
      data: { name, slug, description, sortOrder, isActive: true },
    })
    revalidatePath("/admin/categories")
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la création."
    throw new Error(message)
  }
}

async function deleteCategory(id: string): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  })
  if (!category) throw new Error("Catégorie introuvable.")
  if (category._count.products > 0) {
    throw new Error(
      `Impossible de supprimer : ${category._count.products} produit(s) sont liés à cette catégorie.`
    )
  }

  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression."
    throw new Error(message)
  }
}

async function toggleCategoryActive(id: string, currentValue: boolean): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  try {
    await prisma.category.update({
      where: { id },
      data: { isActive: !currentValue },
    })
    revalidatePath("/admin/categories")
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la mise à jour."
    throw new Error(message)
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActiveBadge({ isActive }: Readonly<{ isActive: boolean }>) {
  if (isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Actif
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      Inactif
    </span>
  )
}

interface ToggleFormProps {
  categoryId: string
  isActive: boolean
  toggleAction: (id: string, currentValue: boolean) => Promise<void>
}

function ToggleForm({ categoryId, isActive, toggleAction }: Readonly<ToggleFormProps>) {
  const boundAction = toggleAction.bind(null, categoryId, isActive)
  return (
    <form action={boundAction}>
      <button
        type="submit"
        className="text-xs text-[#C9A84C] underline-offset-2 hover:underline focus:outline-none"
      >
        {isActive ? "Désactiver" : "Activer"}
      </button>
    </form>
  )
}

interface DeleteFormProps {
  categoryId: string
  productCount: number
  deleteAction: (id: string) => Promise<void>
}

function DeleteForm({ categoryId, productCount, deleteAction }: Readonly<DeleteFormProps>) {
  const boundAction = deleteAction.bind(null, categoryId)
  if (productCount > 0) return null
  return (
    <form action={boundAction}>
      <button
        type="submit"
        className="text-xs text-red-500 underline-offset-2 hover:underline focus:outline-none"
      >
        Supprimer
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCategoriesPage() {
  let categories: CategoryRow[] = []

  try {
    categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    })
  } catch (error: unknown) {
    void error
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ebene md:text-3xl">
            Catégories
          </h1>
          <p className="mt-1 text-sm text-taupe">
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-or-light bg-ivoire">
            <tr>
              {["Nom", "Slug", "Produits", "Ordre", "Statut", "Activer/Désactiver", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-taupe"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5D5C5]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-taupe">
                  Aucune catégorie pour l&apos;instant.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-ivoire/50">
                  <td className="px-4 py-3 text-sm font-medium text-ebene">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-taupe">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ebene">
                    {cat._count.products}
                  </td>
                  <td className="px-4 py-3 text-sm text-ebene">
                    {cat.sortOrder}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge isActive={cat.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleForm
                      categoryId={cat.id}
                      isActive={cat.isActive}
                      toggleAction={toggleCategoryActive}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteForm
                      categoryId={cat.id}
                      productCount={cat._count.products}
                      deleteAction={deleteCategory}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inline create form */}
      <div className="mt-8 rounded-lg border border-or-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-ebene">
          Nouvelle catégorie
        </h2>

        <form
          action={createCategory}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Nom */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-xs font-medium uppercase tracking-wider text-taupe"
            >
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={NAME_MAX_LENGTH}
              placeholder="Soins du visage"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="slug"
              className="text-xs font-medium uppercase tracking-wider text-taupe"
            >
              Slug{" "}
              <span className="normal-case font-normal text-taupe/60">
                (auto si vide)
              </span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              maxLength={SLUG_MAX_LENGTH}
              placeholder="soins-du-visage"
              pattern="^[a-z0-9-]+$"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 font-mono text-sm text-ebene placeholder:font-sans placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Ordre */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sortOrder"
              className="text-xs font-medium uppercase tracking-wider text-taupe"
            >
              Ordre d&apos;affichage
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="description"
              className="text-xs font-medium uppercase tracking-wider text-taupe"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Description courte de la catégorie (optionnel)"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#1A0A00] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
            >
              Créer la catégorie
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
