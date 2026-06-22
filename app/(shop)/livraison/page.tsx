import type { Metadata } from "next"
import Link from "next/link"
import { WHATSAPP_URL } from "@/lib/constants"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Livraison & Délais — Ka Cosmetic",
  description: "Informations sur la livraison Ka Cosmetic : délais, zones, tarifs et conditions.",
}

const ZONES = [
  { zone: "Abidjan — Cocody, Plateau, Marcory", delai: "Même jour (J0)", tarif: "Gratuite dès 50 000 FCFA", note: "Commande avant 14h" },
  { zone: "Abidjan — Autres communes", delai: "J0 — J+1", tarif: "2 500 FCFA", note: "Livraison standard" },
  { zone: "Côte d'Ivoire (hors Abidjan)", delai: "2 à 4 jours ouvrés", tarif: "5 000 FCFA", note: "Transporteur partenaire" },
  { zone: "Afrique de l'Ouest", delai: "5 à 8 jours ouvrés", tarif: "Sur devis", note: "Contacter le service client" },
]

const FAQ_LIVRAISON = [
  {
    q: "Comment suivre ma commande ?",
    a: "Un lien de suivi vous est envoyé par SMS et email dès l'expédition. Vous pouvez également consulter l'état de votre commande dans votre espace client.",
  },
  {
    q: "Puis-je modifier l'adresse de livraison après commande ?",
    a: "Contactez-nous dans les 2h suivant votre commande via WhatsApp ou email. Passé ce délai, la modification n'est plus possible si la préparation a déjà commencé.",
  },
  {
    q: "Que faire si mon colis est endommagé ?",
    a: "Photographiez le colis avant ouverture et contactez-nous dans les 24h. Nous procéderons à un renvoi ou un remboursement selon votre préférence.",
  },
  {
    q: "Livrez-vous à une heure précise ?",
    a: "Pour Abidjan, nous pouvons convenir d'un créneau horaire sur demande. Contactez-nous après votre commande pour préciser vos disponibilités.",
  },
]

export default function LivraisonPage() {
  return (
    <div className="bg-ivoire">

      {/* Header */}
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Livraison &amp; Délais</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Assistance</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Livraison &amp; Délais</h1>
          <p className="mt-3 max-w-lg text-sm font-light text-taupe">
            Ka Cosmetic s&apos;engage à vous livrer vos produits dans les meilleurs délais, avec le plus grand soin.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">

        {/* Zones et tarifs */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl text-ebene">Zones et tarifs</h2>
          <div className="overflow-hidden rounded-2xl border border-or/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-or/20 bg-creme text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-taupe">Zone</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-taupe">Délai</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-taupe">Tarif</th>
                  <th className="hidden px-5 py-4 text-xs font-semibold uppercase tracking-wider text-taupe md:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-or/10 bg-white">
                {ZONES.map((z) => (
                  <tr key={z.zone} className="transition-colors hover:bg-creme/50">
                    <td className="px-5 py-4 font-medium text-ebene">{z.zone}</td>
                    <td className="px-5 py-4 text-brun font-medium">{z.delai}</td>
                    <td className="px-5 py-4 text-taupe">{z.tarif}</td>
                    <td className="hidden px-5 py-4 text-taupe/70 md:table-cell">{z.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-taupe/70">* Livraison gratuite dès 50 000 FCFA pour Abidjan.</p>
        </section>

        {/* Processus */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl text-ebene">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Commande passée", text: "Vous recevez une confirmation par SMS et email avec le récapitulatif." },
              { step: "02", title: "Préparation", text: "Notre équipe prépare votre commande avec soin dans nos entrepôts d'Abidjan." },
              { step: "03", title: "Expédition", text: "Votre colis est confié à notre livreur. Un lien de suivi vous est envoyé." },
              { step: "04", title: "Livraison", text: "Votre commande arrive, emballée avec élégance, prête à vous enchanter." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-or/20 bg-creme p-6">
                <span className="font-mono text-2xl font-bold text-or">{s.step}</span>
                <h3 className="mt-2 font-display text-lg text-ebene">{s.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-taupe">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ livraison */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl text-ebene">Questions fréquentes</h2>
          <div className="flex flex-col gap-4">
            {FAQ_LIVRAISON.map((item) => (
              <div key={item.q} className="rounded-2xl border border-or/20 bg-white p-6">
                <h3 className="font-display text-base text-ebene">{item.q}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-taupe">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA contact */}
        <div className="rounded-2xl bg-creme border border-or/20 px-8 py-10 text-center">
          <p className="font-display text-xl text-ebene mb-2">Une question sur votre livraison ?</p>
          <p className="text-sm text-taupe mb-6">Notre équipe répond en moins d&apos;une heure sur WhatsApp.</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Contacter sur WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2">
              Formulaire de contact
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
