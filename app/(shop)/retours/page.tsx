import type { Metadata } from "next"
import Link from "next/link"
import { WHATSAPP_URL } from "@/lib/constants"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Retours & Échanges — Ka Cosmetic",
  description: "Politique de retour et d'échange Ka Cosmetic. Conditions, délais et procédure de remboursement.",
}

export default function RetoursPage() {
  return (
    <div className="bg-ivoire">

      {/* Header */}
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Retours &amp; Échanges</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Assistance</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Retours &amp; Échanges</h1>
          <p className="mt-3 max-w-lg text-sm font-light text-taupe">
            Votre satisfaction est notre priorité. Nous acceptons les retours sous conditions dans un délai de 14 jours.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">

        {/* Conditions */}
        <section className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-or/20 bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-succes/10 text-succes">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-ebene mb-4">Produits éligibles au retour</h2>
            <ul className="flex flex-col gap-2 text-sm font-light text-taupe">
              {[
                "Produit non ouvert et dans son emballage d'origine",
                "Retour initié dans les 14 jours suivant la réception",
                "Produit non utilisé et en parfait état",
                "Coffrets complets avec tous les composants",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-or" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-erreur/20 bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-erreur/10 text-erreur">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-ebene mb-4">Produits non remboursables</h2>
            <ul className="flex flex-col gap-2 text-sm font-light text-taupe">
              {[
                "Produit ouvert, utilisé ou descellé",
                "Retour initié après 14 jours de réception",
                "Produits vendus en promotion avec mention « non retournable »",
                "Articles personnalisés ou en édition limitée",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-erreur" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Procédure */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl text-ebene">Comment effectuer un retour ?</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: "01", title: "Contactez-nous", text: "Envoyez un message sur WhatsApp ou par email en précisant votre numéro de commande et la raison du retour." },
              { step: "02", title: "Validation du retour", text: "Notre équipe valide votre demande sous 24h ouvrées et vous envoie un bon de retour." },
              { step: "03", title: "Renvoi du produit", text: "Emballez soigneusement le produit et déposez-le chez le transporteur indiqué. Les frais de retour sont à votre charge." },
              { step: "04", title: "Remboursement", text: "À réception et vérification du produit, le remboursement est effectué dans les 5 jours ouvrés sur votre mode de paiement initial." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-5 rounded-2xl border border-or/20 bg-creme px-6 py-5">
                <span className="flex-shrink-0 font-mono text-2xl font-bold text-or">{s.step}</span>
                <div>
                  <h3 className="font-display text-base text-ebene">{s.title}</h3>
                  <p className="mt-1 text-sm font-light text-taupe">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Échanges */}
        <section className="mb-16 rounded-2xl bg-creme border border-or/20 p-8">
          <h2 className="mb-4 font-display text-2xl text-ebene">Échanges</h2>
          <p className="text-sm font-light leading-relaxed text-taupe max-w-2xl">
            Vous souhaitez échanger un produit contre un autre ? Suivez la même procédure qu&apos;un retour en précisant le produit souhaité en échange. Si le montant diffère, nous régularisons la différence. Les échanges sont traités en priorité.
          </p>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-creme border border-or/20 px-8 py-10 text-center">
          <p className="font-display text-xl text-ebene mb-2">Besoin d&apos;aide pour un retour ?</p>
          <p className="text-sm text-taupe mb-6">Notre équipe est disponible du lundi au samedi, de 8h à 20h.</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary inline-flex">
              Formulaire de contact
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
