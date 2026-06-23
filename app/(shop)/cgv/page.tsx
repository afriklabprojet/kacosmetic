import type { Metadata } from "next"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Ka Cosmetic",
  description: "Consultez les conditions générales de vente de Ka Cosmetic.",
}

const DEFAULT_CONTENT = `## Article 1 — Objet
Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre Ka Cosmetic, dont le siège social est situé à Abidjan, Côte d'Ivoire, et tout client effectuant une commande sur le site kacosmetic.ci.

Toute commande implique l'acceptation pleine et entière des présentes CGV.

## Article 2 — Produits
Ka Cosmetic commercialise des produits cosmétiques premium fabriqués à partir d'ingrédients sélectionnés. Les caractéristiques essentielles des produits sont présentées sur chaque fiche produit.

Ka Cosmetic se réserve le droit de modifier la composition ou l'apparence de ses produits sans préavis, dans le respect des normes en vigueur.

## Article 3 — Prix
Les prix sont indiqués en Francs CFA (FCFA), toutes taxes comprises. Ka Cosmetic se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.

Les frais de livraison sont calculés en fonction de la zone géographique et du mode de livraison choisi, et sont indiqués avant la validation finale de la commande.

## Article 4 — Commande
Le client sélectionne les produits souhaités, renseigne ses coordonnées de livraison, choisit son mode de paiement, puis valide sa commande. Un email de confirmation est envoyé après validation.

Ka Cosmetic se réserve le droit d'annuler ou de refuser toute commande en cas de problème de stock, de paiement ou de suspicion de fraude.

## Article 5 — Paiement
Le paiement s'effectue via les moyens de paiement disponibles sur le site (Orange Money, MTN MoMo, Wave, Moov Money, Djamo, Visa, Mastercard), traités de manière sécurisée par Jeko Africa.

La commande n'est confirmée qu'après réception effective du paiement.

## Article 6 — Livraison
La livraison est effectuée à l'adresse indiquée lors de la commande. Les délais indicatifs sont J0 (livraison le jour même sous conditions) et J+1 (livraison le lendemain).

Ka Cosmetic ne peut être tenu responsable des retards imputables à des événements extérieurs (intempéries, grèves, force majeure).

## Article 7 — Retours et remboursements
Tout produit défectueux ou non conforme peut être retourné dans un délai de **7 jours** à compter de la réception. Le produit doit être intact, non ouvert et dans son emballage d'origine.

Pour initier un retour, contactez notre service client via le formulaire de contact ou sur WhatsApp. Les frais de retour sont à la charge du client sauf en cas d'erreur de notre part.

## Article 8 — Données personnelles
Les données collectées lors de la commande sont nécessaires au traitement de celle-ci et ne sont pas transmises à des tiers sans consentement. Consultez notre politique de confidentialité pour plus d'informations.

## Article 9 — Droit applicable
Les présentes CGV sont soumises au droit ivoirien. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.`

const getContent = unstable_cache(
  async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "legal_cgv" } })
    return row?.value ?? DEFAULT_CONTENT
  },
  ["legal_cgv"],
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
        <div className="space-y-3 text-sm leading-relaxed text-taupe">
          {paragraphs.map((para, i) => (
            <p key={i}><InlineText text={para.replace(/\n/g, " ")} /></p>
          ))}
        </div>
      </section>
    )
  })
}

export default async function CgvPage() {
  const content = await getContent()

  return (
    <div className="bg-ivoire">
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">CGV</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Légal</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Conditions Générales de Vente</h1>
          <p className="mt-3 text-sm text-taupe">Dernière mise à jour : janvier 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        {renderContent(content)}
        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>
            Pour toute question relative à ces CGV, contactez-nous à{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a>
          </p>
        </div>
      </div>
    </div>
  )
}
