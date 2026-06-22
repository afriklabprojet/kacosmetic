import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CouponType } from "@prisma/client"

export const dynamic = "force-dynamic"

// ─── Server Actions ───────────────────────────────────────────

async function toggleCoupon(id: string, isActive: boolean): Promise<void> {
  "use server"
  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive },
    })
    revalidatePath("/admin/coupons")
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la mise à jour du coupon"
    )
  }
}

async function deleteCoupon(id: string): Promise<void> {
  "use server"
  try {
    await prisma.coupon.delete({ where: { id } })
    revalidatePath("/admin/coupons")
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la suppression du coupon"
    )
  }
}

async function createCoupon(formData: FormData): Promise<void> {
  "use server"

  const rawCode = formData.get("code")
  const rawType = formData.get("type")
  const rawValue = formData.get("value")
  const rawMinOrderAmount = formData.get("minOrderAmount")
  const rawMaxUses = formData.get("maxUses")
  const rawSingleUse = formData.get("singleUsePerCustomer")
  const rawExpiresAt = formData.get("expiresAt")

  if (typeof rawCode !== "string" || rawCode.trim() === "") {
    throw new Error("Le code coupon est obligatoire")
  }
  if (typeof rawType !== "string" || (rawType !== "PERCENTAGE" && rawType !== "FIXED")) {
    throw new Error("Le type de coupon est invalide")
  }
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new Error("La valeur est obligatoire")
  }

  const value = parseInt(rawValue, 10)
  if (isNaN(value) || value <= 0) {
    throw new Error("La valeur doit être un entier positif")
  }
  if (rawType === "PERCENTAGE" && value > 100) {
    throw new Error("Un pourcentage ne peut pas dépasser 100")
  }

  const minOrderAmount =
    rawMinOrderAmount && typeof rawMinOrderAmount === "string" && rawMinOrderAmount.trim() !== ""
      ? (() => { const v = parseInt(rawMinOrderAmount, 10); return (!isNaN(v) && v >= 0) ? v : null })()
      : null
  const maxUses =
    rawMaxUses && typeof rawMaxUses === "string" && rawMaxUses.trim() !== ""
      ? (() => { const v = parseInt(rawMaxUses, 10); return (!isNaN(v) && v >= 1) ? v : null })()
      : null
  const expiresAt =
    typeof rawExpiresAt === "string" && rawExpiresAt.trim() !== ""
      ? new Date(rawExpiresAt)
      : null

  try {
    await prisma.coupon.create({
      data: {
        code: rawCode.trim().toUpperCase(),
        type: rawType as CouponType,
        value,
        minOrderAmount,
        maxUses,
        singleUsePerCustomer: rawSingleUse === "on",
        expiresAt,
      },
    })
    revalidatePath("/admin/coupons")
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la création du coupon"
    )
  }
}

// ─── Helpers ──────────────────────────────────────────────────

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENTAGE: "%",
  FIXED: "FCFA",
}

function formatExpiry(date: Date | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("fr-CI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ─── Page ─────────────────────────────────────────────────────

export default async function AdminCouponsPage() {
  let coupons: Awaited<ReturnType<typeof prisma.coupon.findMany>> = []
  try {
    coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
  } catch (error: unknown) {
    console.error("[AdminCouponsPage] DB error:", error)
    // retourner un tableau vide — la page s'affiche avec une liste vide
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ebene">
        Coupons
      </h1>

      {/* ── Liste ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-or-light bg-ivoire">
            <tr>
              {[
                "Code",
                "Réduction",
                "Utilisations",
                "Usage unique",
                "Expire le",
                "Statut",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-taupe"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-creme">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-ivoire/50">
                {/* Code */}
                <td className="px-4 py-3 font-mono text-xs font-semibold text-ebene">
                  {coupon.code}
                </td>

                {/* Réduction */}
                <td className="px-4 py-3 text-ebene">
                  <span className="font-medium">
                    {coupon.value}
                    {TYPE_LABEL[coupon.type]}
                  </span>
                  {coupon.type === "PERCENTAGE" && (
                    <span className="ml-1 text-xs text-taupe">de réduction</span>
                  )}
                  {coupon.minOrderAmount !== null && (
                    <p className="mt-0.5 text-xs text-taupe">
                      min. {coupon.minOrderAmount.toLocaleString("fr-CI")} FCFA
                    </p>
                  )}
                </td>

                {/* Utilisations */}
                <td className="px-4 py-3 text-center text-ebene">
                  <span className="font-medium">{coupon.usedCount}</span>
                  {coupon.maxUses !== null && (
                    <span className="text-taupe"> / {coupon.maxUses}</span>
                  )}
                  {coupon.maxUses === null && (
                    <span className="text-taupe"> / ∞</span>
                  )}
                </td>

                {/* Usage unique par client */}
                <td className="px-4 py-3 text-center">
                  {coupon.singleUsePerCustomer ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Oui
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      Non
                    </span>
                  )}
                </td>

                {/* Expiration */}
                <td className="px-4 py-3 text-xs text-taupe">
                  {formatExpiry(coupon.expiresAt)}
                </td>

                {/* Statut + toggle */}
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server"
                      await toggleCoupon(coupon.id, !coupon.isActive)
                    }}
                  >
                    <button
                      type="submit"
                      className={`inline-flex cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {coupon.isActive ? "Actif" : "Inactif"}
                    </button>
                  </form>
                </td>

                {/* Suppression */}
                <td className="px-4 py-3">
                  <form
                    action={async () => {
                      "use server"
                      await deleteCoupon(coupon.id)
                    }}
                  >
                    {/* data-confirm est lisible par un script global ou un Client Component wrapper
                        pour afficher une confirmation avant soumission du formulaire.
                        Une confirmation JS interactive nécessiterait un Client Component. */}
                    <button
                      type="submit"
                      data-confirm="Supprimer ce coupon ?"
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-taupe"
                >
                  Aucun coupon créé pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Formulaire de création ───────────────────────────── */}
      <div className="mt-8 rounded-lg border border-or-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-ebene">
          Créer un coupon
        </h2>

        <form action={createCoupon} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Code */}
          <div className="flex flex-col gap-1">
            <label htmlFor="code" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="PROMO20"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm uppercase text-ebene placeholder:normal-case placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue="PERCENTAGE"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            >
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (FCFA)</option>
            </select>
          </div>

          {/* Valeur */}
          <div className="flex flex-col gap-1">
            <label htmlFor="value" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Valeur <span className="text-red-500">*</span>
            </label>
            <input
              id="value"
              name="value"
              type="number"
              required
              min={1}
              placeholder="20"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Montant minimum */}
          <div className="flex flex-col gap-1">
            <label htmlFor="minOrderAmount" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Montant minimum (FCFA)
            </label>
            <input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min={0}
              placeholder="Optionnel"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Nombre max d'utilisations */}
          <div className="flex flex-col gap-1">
            <label htmlFor="maxUses" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Utilisations max
            </label>
            <input
              id="maxUses"
              name="maxUses"
              type="number"
              min={1}
              placeholder="Illimité"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Date d'expiration */}
          <div className="flex flex-col gap-1">
            <label htmlFor="expiresAt" className="text-xs font-medium uppercase tracking-wider text-taupe">
              Expire le
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          {/* Usage unique par client */}
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <input
              id="singleUsePerCustomer"
              name="singleUsePerCustomer"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-or-light accent-[#C9A84C]"
            />
            <label htmlFor="singleUsePerCustomer" className="text-sm text-ebene">
              Usage unique par client
            </label>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#1A0A00] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
            >
              Créer le coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
