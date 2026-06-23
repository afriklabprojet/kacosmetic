import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import CategoryImageUploadBtn from "./CategoryImageUploadBtn"
import CategoryCreateForm from "./CategoryCreateForm"

export const dynamic = "force-dynamic"

// ─── Server Actions ───────────────────────────────────────────────────────────

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
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression."
    throw new Error(message)
  }
}

async function toggleCategoryActive(id: string, currentValue: boolean): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  try {
    await prisma.category.update({ where: { id }, data: { isActive: !currentValue } })
    revalidatePath("/admin/categories")
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour."
    throw new Error(message)
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActiveBadge({ isActive }: Readonly<{ isActive: boolean }>) {
  return isActive ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Actif</span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Inactif</span>
  )
}

function ToggleForm({ categoryId, isActive, toggleAction }: Readonly<{
  categoryId: string
  isActive: boolean
  toggleAction: (id: string, v: boolean) => Promise<void>
}>) {
  const action = toggleAction.bind(null, categoryId, isActive)
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-[#C9A84C] underline-offset-2 hover:underline">
        {isActive ? "Désactiver" : "Activer"}
      </button>
    </form>
  )
}

function DeleteForm({ categoryId, productCount, deleteAction }: Readonly<{
  categoryId: string
  productCount: number
  deleteAction: (id: string) => Promise<void>
}>) {
  if (productCount > 0) return null
  const action = deleteAction.bind(null, categoryId)
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 underline-offset-2 hover:underline">
        Supprimer
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true, sortOrder: true, isActive: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  }).catch(() => [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ebene md:text-3xl">Catégories</h1>
        <p className="mt-1 text-sm text-taupe">{categories.length} catégorie{categories.length !== 1 ? "s" : ""} au total</p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-or-light bg-ivoire">
            <tr>
              {["Nom", "Slug", "Image", "Produits", "Ordre", "Statut", "Activer/Désactiver", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-taupe">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5D5C5]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-taupe">Aucune catégorie pour l&apos;instant.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-ivoire/50">
                  <td className="px-4 py-3 text-sm font-medium text-ebene">{cat.name}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-taupe">{cat.slug}</span></td>
                  <td className="px-4 py-3">
                    <CategoryImageUploadBtn
                      categoryId={cat.id}
                      categoryName={cat.name}
                      currentImageUrl={cat.imageUrl}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-ebene">{cat._count.products}</td>
                  <td className="px-4 py-3 text-sm text-ebene">{cat.sortOrder}</td>
                  <td className="px-4 py-3"><ActiveBadge isActive={cat.isActive} /></td>
                  <td className="px-4 py-3">
                    <ToggleForm categoryId={cat.id} isActive={cat.isActive} toggleAction={toggleCategoryActive} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteForm categoryId={cat.id} productCount={cat._count.products} deleteAction={deleteCategory} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="mt-8 rounded-lg border border-or-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-ebene">Nouvelle catégorie</h2>
        <CategoryCreateForm />
      </div>
    </div>
  )
}
