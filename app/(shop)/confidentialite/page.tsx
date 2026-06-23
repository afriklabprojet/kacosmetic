import type { Metadata } from "next"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Politique de confidentialité — Ka Cosmetic",
  description: "Comment Ka Cosmetic collecte, utilise et protège vos données personnelles.",
}

const DEFAULT_CONTENT = `## 1. Responsable du traitement
Ka Cosmetic, société établie à Abidjan, Côte d'Ivoire, est responsable du traitement des données personnelles collectées sur le site kacosmetic.ci.

Contact : contact@kacosmetic.ci

## 2. Données collectées
Nous collectons les données suivantes :
- **Données d'identité** : nom, prénom, adresse email
- **Données de contact** : numéro de téléphone, adresse de livraison
- **Données de commande** : produits commandés, montants, statuts
- **Données de navigation** : adresse IP, pages visitées, durée de session
- **Données de compte** : si vous créez un compte, votre email et historique de commandes

## 3. Finalités du traitement
Vos données sont utilisées pour traiter et livrer vos commandes, vous envoyer des confirmations par email et SMS, gérer votre compte client, vous envoyer notre newsletter (avec votre consentement), améliorer notre site et respecter nos obligations légales.

## 4. Base légale
Le traitement est fondé sur l'exécution du contrat de vente (commandes), votre consentement (newsletter), et nos intérêts légitimes (amélioration du service, prévention de la fraude).

## 5. Conservation des données
Vos données de commande sont conservées pendant **5 ans** à compter de la commande. Vos données de compte sont conservées tant que votre compte est actif. Les données de newsletter sont supprimées sur demande.

## 6. Partage des données
Vos données peuvent être partagées avec : **Jeko Africa** (paiements), **Resend** (emails), **Twilio** (SMS), **Cloudinary** (images).

Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.

## 7. Vos droits
Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition et de portabilité. Pour exercer vos droits, contactez-nous à contact@kacosmetic.ci.

## 8. Cookies
Notre site utilise uniquement des cookies techniques nécessaires au fonctionnement (session, panier). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.

## 9. Sécurité
Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : connexions chiffrées (HTTPS), accès restreint aux données, authentification sécurisée.`

const getContent = unstable_cache(
  async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: "legal_confidentialite" } })
    return row?.value ?? DEFAULT_CONTENT
  },
  ["legal_confidentialite"],
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
          {paragraphs.map((para, i) => {
            const lines = para.split("\n")
            const isList = lines.every(l => l.startsWith("- "))
            if (isList) {
              return (
                <ul key={i} className="ml-4 list-disc space-y-1">
                  {lines.map((l, j) => (
                    <li key={j}><InlineText text={l.replace(/^- /, "")} /></li>
                  ))}
                </ul>
              )
            }
            return <p key={i}><InlineText text={para.replace(/\n/g, " ")} /></p>
          })}
        </div>
      </section>
    )
  })
}

export default async function ConfidentialitePage() {
  const content = await getContent()

  return (
    <div className="bg-ivoire">
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Confidentialité</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Légal</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Politique de confidentialité</h1>
          <p className="mt-3 text-sm text-taupe">Dernière mise à jour : janvier 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        {renderContent(content)}
        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>
            Pour toute question, contactez-nous à{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a>{" "}
            ou via notre <Link href="/contact" className="text-or hover:underline">formulaire de contact</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
