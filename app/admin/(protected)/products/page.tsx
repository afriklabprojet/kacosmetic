import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import Link from "next/link"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

// ─── Server Action ────────────────────────────────────────────────────────────

async function toggleProductActive(
  productId: string,
  currentValue: boolean
): Promise<void> {
  "use server"
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !currentValue },
      select: { slug: true, category: { select: { slug: true } } },
    })
    revalidatePath("/admin/products")
    revalidateTag("products")
    revalidateTag(`product-${product.slug}`)
    if (product.category.slug) revalidateTag(`cat-${product.category.slug}`)
  } catch (error: unknown) {
    console.error("[toggleProductActive] Prisma update failed", error)
    throw new Error("Impossible de modifier le statut du produit.")
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-CI")} FCFA`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-CI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  category: { name: string }
  totalStock: number
  minPrice: number | null
}

// ─── Data fetching ────────────────────────────────────────────────────────────

interface FetchProductsParams {
  query: string
  page: number
}

const MAX_QUERY_LENGTH = 100

async function fetchProducts({
  query,
  page,
}: FetchProductsParams): Promise<{ rows: ProductRow[]; total: number }> {
  const safeQuery = query.slice(0, MAX_QUERY_LENGTH)
  const skip = (page - 1) * PAGE_SIZE

  const where = safeQuery
    ? { name: { contains: safeQuery, mode: "insensitive" as const } }
    : {}

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          category: { select: { name: true } },
          variants: {
            where: { isActive: true },
            select: { stock: true, reservedStock: true, price: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const rows: ProductRow[] = products.map((p) => {
      const totalStock = p.variants.reduce(
        (sum, v) => sum + v.stock - v.reservedStock,
        0
      )
      const prices = p.variants.map((v) => v.price)
      const minPrice = prices.length > 0 ? Math.min(...prices) : null

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        isActive: p.isActive,
        createdAt: p.createdAt,
        category: p.category,
        totalStock,
        minPrice,
      }
    })

    return { rows, total }
  } catch (error: unknown) {
    console.error("[fetchProducts] Prisma query failed", error)
    throw new Error("Impossible de charger la liste des produits.")
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
  productId: string
  isActive: boolean
  toggleAction: (productId: string, currentValue: boolean) => Promise<void>
}

function ToggleForm({ productId, isActive, toggleAction }: Readonly<ToggleFormProps>) {
  const boundAction = toggleAction.bind(null, productId, isActive)
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

interface PaginationProps {
  page: number
  total: number
  query: string
}

function Pagination({ page, total, query }: Readonly<PaginationProps>) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null

  function buildHref(targetPage: number): string {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    params.set("page", String(targetPage))
    return `/admin/products?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between border-t border-[#E5D5C5] bg-white px-4 py-3">
      <p className="text-sm text-[#6B5744]">
        Page {page} sur {totalPages} — {total} produit{total > 1 ? "s" : ""}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="rounded border border-[#E5D5C5] px-3 py-1 text-sm text-[#1A0A00] hover:bg-[#FAF6F1]"
          >
            Précédent
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            className="rounded border border-[#E5D5C5] px-3 py-1 text-sm text-[#1A0A00] hover:bg-[#FAF6F1]"
          >
            Suivant
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<Record<string, never>>
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams
  const query = q?.trim() ?? ""
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const { rows, total } = await fetchProducts({ query, page })

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1A0A00] md:text-3xl">
            Produits
          </h1>
          <p className="mt-1 text-sm text-[#6B5744]">
            {total.toLocaleString("fr-CI")} produit{total > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/admin/products/nouveau"
          className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] transition-colors hover:bg-[#b8932a]"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/products" className="mb-4">
        <div className="flex max-w-sm gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Rechercher par nom…"
            className="flex-1 rounded border border-[#E5D5C5] bg-white px-3 py-2 text-sm text-[#1A0A00] placeholder-[#6B5744]/50 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
          <button
            type="submit"
            className="rounded border border-[#E5D5C5] bg-white px-4 py-2 text-sm font-medium text-[#1A0A00] hover:bg-[#FAF6F1]"
          >
            Chercher
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E5D5C5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5D5C5]">
            <thead className="bg-[#FAF6F1]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Prix min
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Créé le
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D5C5]">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-[#6B5744]"
                  >
                    {query
                      ? `Aucun produit trouvé pour « ${query} »`
                      : "Aucun produit pour l'instant."}
                  </td>
                </tr>
              ) : (
                rows.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-[#FAF6F1]/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1A0A00]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#6B5744]">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1A0A00]">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1A0A00]">
                      {product.totalStock.toLocaleString("fr-CI")}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1A0A00]">
                      {product.minPrice !== null
                        ? formatPrice(product.minPrice)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActiveBadge isActive={product.isActive} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B5744]">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleForm
                        productId={product.id}
                        isActive={product.isActive}
                        toggleAction={toggleProductActive}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} total={total} query={query} />
      </div>
    </div>
  )
}
