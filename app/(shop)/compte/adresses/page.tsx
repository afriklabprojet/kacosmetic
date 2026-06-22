import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MapPin, Plus } from "lucide-react"
import DeleteAddressButton from "./DeleteAddressButton"

export const metadata: Metadata = {
  title: "Mes adresses — Ka Cosmetic",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

export default async function CompteAdressesPage() {
  const session = await auth()
  if (!session?.user) redirect("/connexion?next=/compte/adresses")

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ebene">Mes adresses</h1>
        <Link
          href="/compte/adresses/nouvelle"
          className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={15} />
          Ajouter
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="py-16 text-center">
          <MapPin size={48} className="mx-auto mb-4 text-or-light" />
          <p className="font-display text-lg text-taupe">Aucune adresse enregistrée</p>
          <p className="mt-1 text-sm text-taupe">
            Ajoutez une adresse pour accélérer vos prochaines commandes.
          </p>
          <Link href="/compte/adresses/nouvelle" className="btn-primary mt-4 inline-flex">
            Ajouter une adresse
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <li key={addr.id} className="relative rounded-md border border-or-light bg-white p-5">
              {addr.isDefault && (
                <span className="absolute right-3 top-3 rounded-full bg-or/10 px-2 py-0.5 text-xs font-medium text-or">
                  Par défaut
                </span>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-or" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ebene">
                    {addr.firstName} {addr.lastName}
                  </p>
                  {addr.label && <p className="text-xs text-or">{addr.label}</p>}
                  <p className="mt-1 text-sm text-taupe">{addr.street}</p>
                  <p className="text-sm text-taupe">{addr.neighborhood}, {addr.commune}</p>
                  <p className="text-sm text-taupe">{addr.city}</p>
                  <p className="mt-0.5 text-sm text-taupe">{addr.phone}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-or-light pt-3">
                <Link
                  href={`/compte/adresses/nouvelle?edit=${addr.id}`}
                  className="text-xs font-medium text-brun hover:underline"
                >
                  Modifier
                </Link>
                <DeleteAddressButton addressId={addr.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
