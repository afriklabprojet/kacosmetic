import type { Metadata } from "next"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Mentions légales — Ka Cosmetic",
  description: "Mentions légales du site kacosmetic.ci.",
}

const DEFAULT_CONTENT = `## Éditeur du site
**Dénomination** : Ka Cosmetic
**Forme juridique** : Entreprise individuelle
**Siège social** : Abidjan, Côte d'Ivoire
**Email** : contact@kacosmetic.ci
**Site web** : kacosmetic.ci

## Directeur de la publication
Le directeur de la publication est le représentant légal de Ka Cosmetic.

## Hébergement
**Hébergeur** : Vercel Inc.
**Adresse** : 340 Pine Street, Suite 900, San Francisco, CA 94104, États-Unis
**Site** : vercel.com

## Base de données
**Prestataire** : Neon (PostgreSQL)
**Site** : neon.tech

## Propriété intellectuelle
L'ensemble des éléments constituant le site kacosmetic.ci (textes, images, visuels, logo, marque) sont la propriété exclusive de Ka Cosmetic et sont protégés par le droit de la propriété intellectuelle.

Toute reproduction, représentation, modification ou exploitation, totale ou partielle, de ces éléments sans autorisation écrite préalable est strictement interdite.

## Responsabilité
Ka Cosmetic s'efforce d'assurer l'exactitude des informations publiées sur le site mais ne peut garantir leur exhaustivité ni leur mise à jour permanente.

## Liens hypertextes
Le site peut contenir des liens vers des sites tiers. Ka Cosmetic n'exerce aucun contrôle sur ces sites et n'en est pas responsable.

## Données personnelles
Pour en savoir plus sur le traitement de vos données personnelles, consultez notre politique de confidentialité.

## Droit applicable
Le présent site et ses mentions légales sont soumis au droit ivoirien. Tout litige relatif à l'utilisation du site relève de la compétence des tribunaux d'Abidjan.`

const getContent = unstable_cache(
  async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "legal_mentions" } })
    return row?.value ?? DEFAULT_CONTENT
  },
  ["legal_mentions"],
  { revalidate: 3600, tags: ["site-settings"] }
)

function InlineText({ text }: Readonly<{ text: string }>) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-ebene">{part}</strong> : part
      )}
    </>
  )
}

function renderContent(content: string) {
  const sections = content.split(/^## /m).filter(Boolean)
  return sections.map((section) => {
    const newlineIdx = section.indexOf("\n")
    const title = newlineIdx === -1 ? section.trim() : section.slice(0, newlineIdx).trim()
    const body = newlineIdx === -1 ? "" : section.slice(newlineIdx + 1).trim()
    const paragraphs = body.split(/\n\n+/)
    return (
      <section key={title} className="mb-8">
        <h2 className="font-display mb-3 text-lg font-semibold text-ebene">{title}</h2>
        <div className="space-y-2 text-sm leading-relaxed text-taupe">
          {paragraphs.map((para, i) => (
            <p key={i}>
              <InlineText text={para.replace(/\n/g, " ")} />
            </p>
          ))}
        </div>
      </section>
    )
  })
}

export default async function MentionsLegalesPage() {
  const content = await getContent()

  return (
    <div className="bg-ivoire">
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Mentions légales</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Légal</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Mentions légales</h1>
          <p className="mt-3 text-sm text-taupe">Dernière mise à jour : janvier 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        {renderContent(content)}
        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>Contact : <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a></p>
        </div>
      </div>
    </div>
  )
}
