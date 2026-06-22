import { Fragment } from "react"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// ─── Types ────────────────────────────────────────────────────

interface DeliveryZoneRow {
  id: string
  name: string
  communes: string[]
  priceJ0: number
  priceJ1: number
  minOrderJ0: number | null
  isActive: boolean
}

// ─── Server Actions ───────────────────────────────────────────

async function toggleZoneActive(id: string, isActive: boolean): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return
  try {
    await prisma.deliveryZone.update({
      where: { id },
      data: { isActive },
    })
    revalidatePath("/admin/delivery")
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la mise à jour de la zone"
    )
  }
}

async function updateZone(formData: FormData): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const id = formData.get("id")
  const rawPriceJ0 = formData.get("priceJ0")
  const rawPriceJ1 = formData.get("priceJ1")
  const rawMinOrderJ0 = formData.get("minOrderJ0")
  const rawIsActive = formData.get("isActive")

  if (typeof id !== "string" || id.trim() === "") {
    throw new Error("Identifiant de zone invalide")
  }
  if (typeof rawPriceJ0 !== "string" || rawPriceJ0.trim() === "") {
    throw new Error("Le tarif J0 est obligatoire")
  }
  if (typeof rawPriceJ1 !== "string" || rawPriceJ1.trim() === "") {
    throw new Error("Le tarif J+1 est obligatoire")
  }

  const priceJ0 = parseInt(rawPriceJ0, 10)
  if (isNaN(priceJ0) || priceJ0 <= 0) {
    throw new Error("Le tarif J0 doit être un entier positif")
  }

  const priceJ1 = parseInt(rawPriceJ1, 10)
  if (isNaN(priceJ1) || priceJ1 <= 0) {
    throw new Error("Le tarif J+1 doit être un entier positif")
  }

  const minOrderJ0 =
    typeof rawMinOrderJ0 === "string" && rawMinOrderJ0.trim() !== ""
      ? (() => {
          const v = parseInt(rawMinOrderJ0, 10)
          return !isNaN(v) && v >= 0 ? v : null
        })()
      : null

  const isActive = rawIsActive === "on"

  try {
    await prisma.deliveryZone.update({
      where: { id: id.trim() },
      data: { priceJ0, priceJ1, minOrderJ0, isActive },
    })
    revalidatePath("/admin/delivery")
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la mise à jour de la zone"
    )
  }
}

async function createZone(formData: FormData): Promise<void> {
  "use server"
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return

  const rawName = formData.get("name")
  const rawCommunes = formData.get("communes")
  const rawPriceJ0 = formData.get("priceJ0")
  const rawPriceJ1 = formData.get("priceJ1")
  const rawMinOrderJ0 = formData.get("minOrderJ0")

  if (typeof rawName !== "string" || rawName.trim() === "") {
    throw new Error("Le nom de la zone est obligatoire")
  }
  if (typeof rawCommunes !== "string" || rawCommunes.trim() === "") {
    throw new Error("Au moins une commune est requise")
  }
  if (typeof rawPriceJ0 !== "string" || rawPriceJ0.trim() === "") {
    throw new Error("Le tarif J0 est obligatoire")
  }
  if (typeof rawPriceJ1 !== "string" || rawPriceJ1.trim() === "") {
    throw new Error("Le tarif J+1 est obligatoire")
  }

  const priceJ0 = parseInt(rawPriceJ0, 10)
  if (isNaN(priceJ0) || priceJ0 <= 0) {
    throw new Error("Le tarif J0 doit être un entier positif")
  }

  const priceJ1 = parseInt(rawPriceJ1, 10)
  if (isNaN(priceJ1) || priceJ1 <= 0) {
    throw new Error("Le tarif J+1 doit être un entier positif")
  }

  const communes = rawCommunes
    .split("\n")
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  if (communes.length === 0) {
    throw new Error("Au moins une commune est requise")
  }

  const minOrderJ0 =
    typeof rawMinOrderJ0 === "string" && rawMinOrderJ0.trim() !== ""
      ? (() => {
          const v = parseInt(rawMinOrderJ0, 10)
          return !isNaN(v) && v >= 0 ? v : null
        })()
      : null

  try {
    await prisma.deliveryZone.create({
      data: {
        name: rawName.trim(),
        communes,
        priceJ0,
        priceJ1,
        minOrderJ0,
      },
    })
    revalidatePath("/admin/delivery")
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Erreur lors de la création de la zone"
    )
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function formatFcfa(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA"
}

// ─── Input shared style ───────────────────────────────────────

const INPUT_CLS =
  "rounded-md border border-or-light bg-ivoire px-3 py-1.5 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 w-full"

const LABEL_CLS = "text-xs font-medium uppercase tracking-wider text-taupe"

// ─── Page ─────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ editing?: string }>
}

export default async function AdminDeliveryPage({ searchParams }: PageProps) {
  const { editing } = await searchParams

  let zones: DeliveryZoneRow[] = []
  try {
    zones = await prisma.deliveryZone.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        communes: true,
        priceJ0: true,
        priceJ1: true,
        minOrderJ0: true,
        isActive: true,
      },
    })
  } catch (error: unknown) {
    console.error("[AdminDeliveryPage] DB error:", error)
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ebene">
        Livraison &amp; Zones
      </h1>

      {/* ── Liste des zones ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-or-light bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-or-light bg-ivoire">
            <tr>
              {[
                "Nom",
                "Communes",
                "Tarif J0",
                "Tarif J+1",
                "Min commande J0",
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
            {zones.map((zone) => {
              const isEditing = editing === zone.id
              return (
                <Fragment key={zone.id}>
                  {/* ── Ligne principale ── */}
                  <tr className="hover:bg-ivoire/50">
                    {/* Nom */}
                    <td className="px-4 py-3 font-medium text-ebene">
                      {zone.name}
                    </td>

                    {/* Communes */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {zone.communes.map((commune) => (
                          <span
                            key={commune}
                            className="rounded bg-[#F1ECE6] px-1.5 py-0.5 text-xs text-[#6B5744]"
                          >
                            {commune}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Tarif J0 */}
                    <td className="px-4 py-3 text-ebene">
                      {formatFcfa(zone.priceJ0)}
                    </td>

                    {/* Tarif J+1 */}
                    <td className="px-4 py-3 text-ebene">
                      {formatFcfa(zone.priceJ1)}
                    </td>

                    {/* Min commande J0 */}
                    <td className="px-4 py-3 text-ebene">
                      {zone.minOrderJ0 !== null
                        ? formatFcfa(zone.minOrderJ0)
                        : <span className="text-taupe">—</span>}
                    </td>

                    {/* Statut + toggle rapide */}
                    <td className="px-4 py-3">
                      <form
                        action={async () => {
                          "use server"
                          await toggleZoneActive(zone.id, !zone.isActive)
                        }}
                      >
                        <button
                          type="submit"
                          className={`inline-flex cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
                            zone.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {zone.isActive ? "Actif" : "Inactif"}
                        </button>
                      </form>
                    </td>

                    {/* Modifier / Fermer */}
                    <td className="px-4 py-3">
                      <a
                        href={
                          isEditing
                            ? "/admin/delivery"
                            : `/admin/delivery?editing=${zone.id}`
                        }
                        className="rounded px-2 py-1 text-xs font-medium text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
                      >
                        {isEditing ? "Fermer" : "Modifier"}
                      </a>
                    </td>
                  </tr>

                  {/* ── Formulaire d'édition inline ── */}
                  {isEditing && (
                    <tr className="bg-[#FAF6F1]">
                      <td colSpan={7} className="px-4 pb-4 pt-2">
                        <form
                          action={updateZone}
                          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                        >
                          <input type="hidden" name="id" value={zone.id} />

                          {/* Tarif J0 */}
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`edit-priceJ0-${zone.id}`} className={LABEL_CLS}>
                              Tarif J0 (FCFA) <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`edit-priceJ0-${zone.id}`}
                              name="priceJ0"
                              type="number"
                              required
                              min={1}
                              defaultValue={zone.priceJ0}
                              className={INPUT_CLS}
                            />
                          </div>

                          {/* Tarif J+1 */}
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`edit-priceJ1-${zone.id}`} className={LABEL_CLS}>
                              Tarif J+1 (FCFA) <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`edit-priceJ1-${zone.id}`}
                              name="priceJ1"
                              type="number"
                              required
                              min={1}
                              defaultValue={zone.priceJ1}
                              className={INPUT_CLS}
                            />
                          </div>

                          {/* Min commande J0 */}
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`edit-minOrderJ0-${zone.id}`} className={LABEL_CLS}>
                              Min commande J0 (FCFA)
                            </label>
                            <input
                              id={`edit-minOrderJ0-${zone.id}`}
                              name="minOrderJ0"
                              type="number"
                              min={0}
                              defaultValue={zone.minOrderJ0 ?? ""}
                              placeholder="Optionnel"
                              className={INPUT_CLS}
                            />
                          </div>

                          {/* Actif */}
                          <div className="flex flex-col gap-1 justify-end">
                            <div className="flex items-center gap-2 pb-1.5">
                              <input
                                id={`edit-isActive-${zone.id}`}
                                name="isActive"
                                type="checkbox"
                                defaultChecked={zone.isActive}
                                className="h-4 w-4 rounded border-or-light accent-[#C9A84C]"
                              />
                              <label
                                htmlFor={`edit-isActive-${zone.id}`}
                                className="text-sm text-ebene"
                              >
                                Zone active
                              </label>
                            </div>
                          </div>

                          {/* Bouton enregistrer */}
                          <div className="sm:col-span-2 lg:col-span-4">
                            <button
                              type="submit"
                              className="rounded-md bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#1A0A00] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {zones.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-taupe">
                  Aucune zone de livraison configurée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Formulaire de création ───────────────────────────── */}
      <div className="mt-8 rounded-lg border border-or-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-ebene">
          Créer une zone de livraison
        </h2>

        <form
          action={createZone}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Nom */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className={LABEL_CLS}>
              Nom de la zone <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex : Cocody Nord"
              className={INPUT_CLS}
            />
          </div>

          {/* Tarif J0 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="priceJ0" className={LABEL_CLS}>
              Tarif J0 (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              id="priceJ0"
              name="priceJ0"
              type="number"
              required
              min={1}
              placeholder="1500"
              className={INPUT_CLS}
            />
          </div>

          {/* Tarif J+1 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="priceJ1" className={LABEL_CLS}>
              Tarif J+1 (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              id="priceJ1"
              name="priceJ1"
              type="number"
              required
              min={1}
              placeholder="1000"
              className={INPUT_CLS}
            />
          </div>

          {/* Min commande J0 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="minOrderJ0" className={LABEL_CLS}>
              Min commande J0 (FCFA)
            </label>
            <input
              id="minOrderJ0"
              name="minOrderJ0"
              type="number"
              min={0}
              placeholder="Optionnel"
              className={INPUT_CLS}
            />
          </div>

          {/* Communes */}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
            <label htmlFor="communes" className={LABEL_CLS}>
              Communes couvertes <span className="text-red-500">*</span>
              <span className="ml-1 font-normal normal-case text-taupe/70">
                (une par ligne)
              </span>
            </label>
            <textarea
              id="communes"
              name="communes"
              required
              rows={4}
              placeholder={"Cocody\nRiviera\nAbatta"}
              className="rounded-md border border-or-light bg-ivoire px-3 py-2 text-sm text-ebene placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 w-full resize-y"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#1A0A00] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
            >
              Créer la zone
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
