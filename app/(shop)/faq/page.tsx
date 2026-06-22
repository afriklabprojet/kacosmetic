import type { Metadata } from "next"
import Link from "next/link"
import { WHATSAPP_URL } from "@/lib/constants"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "FAQ — Ka Cosmetic",
  description: "Questions fréquentes sur Ka Cosmetic : commandes, livraisons, produits, paiements et compte client.",
}

const FAQ_CATEGORIES = [
  {
    category: "Commandes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    items: [
      { q: "Comment passer une commande ?", a: "Ajoutez vos produits au panier, puis suivez les étapes de commande : informations de livraison, mode de paiement et confirmation. Vous recevrez un email récapitulatif immédiatement après." },
      { q: "Puis-je modifier ma commande après validation ?", a: "Oui, dans les 2 heures suivant la commande. Contactez-nous rapidement via WhatsApp avec votre numéro de commande." },
      { q: "Comment annuler une commande ?", a: "Les annulations sont possibles avant l'expédition. Contactez notre service client dans les plus brefs délais. Si la commande est déjà expédiée, procédez à un retour à la réception." },
      { q: "Proposez-vous des commandes en gros ?", a: "Oui, nous avons une offre B2B pour les revendeurs et professionnels. Contactez-nous par email pour obtenir notre catalogue grossiste et les conditions tarifaires." },
    ],
  },
  {
    category: "Produits",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    items: [
      { q: "Vos produits conviennent-ils aux peaux sensibles ?", a: "Oui. Toutes nos formules sont testées dermatologiquement et conçues pour respecter les peaux sensibles. Chaque fiche produit précise les types de peau concernés." },
      { q: "Vos produits sont-ils cruelty-free ?", a: "Absolument. Aucun de nos produits n'est testé sur les animaux. Nous sommes engagés dans une démarche éthique et respectueuse du vivant." },
      { q: "Quelle est la durée de conservation après ouverture ?", a: "Chaque produit porte la mention PAO (Période Après Ouverture) indiquée par une icône de pot ouvert avec le nombre de mois. En général, entre 6 et 24 mois selon la formule." },
      { q: "Les produits contiennent-ils des parabènes ?", a: "Non. Nos formules sont sans parabènes, sans sulfates agressifs et sans colorants artificiels. Retrouvez la liste complète des ingrédients sur chaque fiche produit." },
    ],
  },
  {
    category: "Paiements",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    items: [
      { q: "Quels modes de paiement acceptez-vous ?", a: "Wave, Orange Money, MTN Mobile Money, Djamo, Moov Money, Visa et Mastercard. Tous les paiements sont sécurisés et chiffrés." },
      { q: "Le paiement est-il sécurisé ?", a: "Oui. Nous utilisons des protocoles de sécurité conformes aux standards bancaires internationaux. Vos données de paiement ne sont jamais stockées sur nos serveurs." },
      { q: "Puis-je payer à la livraison ?", a: "Le paiement à la livraison est disponible pour Abidjan uniquement. Sélectionnez cette option lors du passage de commande." },
      { q: "Comment utiliser un code promo ?", a: "Entrez votre code promo dans le champ prévu à cet effet lors de l'étape de paiement. La réduction s'applique automatiquement au montant total." },
    ],
  },
  {
    category: "Compte client",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    items: [
      { q: "Comment créer un compte ?", a: "Cliquez sur « Mon Compte » en haut de la page et choisissez « Créer un compte ». Vous pouvez également vous connecter avec votre compte Google ou Facebook." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Sur la page de connexion, cliquez sur « Mot de passe oublié ». Vous recevrez un lien de réinitialisation par email dans les minutes suivantes." },
      { q: "Puis-je supprimer mon compte ?", a: "Oui. Contactez notre service client par email en indiquant votre adresse email de connexion. La suppression est effective sous 30 jours conformément au RGPD." },
      { q: "Comment accéder à mes commandes passées ?", a: "Dans votre espace client, section « Mes Commandes ». Vous y trouverez l'historique complet, les statuts de livraison et les factures PDF téléchargeables." },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="bg-ivoire">

      {/* Header */}
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">FAQ</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Assistance</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Questions fréquentes</h1>
          <p className="mt-3 max-w-lg text-sm font-light text-taupe">
            Trouvez rapidement une réponse à vos questions. Si vous ne trouvez pas, notre équipe est là pour vous aider.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">

        {/* Navigation catégories */}
        <div className="mb-12 flex flex-wrap gap-3">
          {FAQ_CATEGORIES.map((cat) => (
            <a
              key={cat.category}
              href={`#${cat.category.toLowerCase().replace(/\s/g, "-")}`}
              className="flex items-center gap-2 rounded-full border border-or/25 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-taupe transition-colors hover:border-or hover:text-or"
            >
              {cat.icon}
              {cat.category}
            </a>
          ))}
        </div>

        {/* FAQ par catégorie */}
        <div className="flex flex-col gap-16">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.category} id={cat.category.toLowerCase().replace(/\s/g, "-")}>
              <div className="mb-6 flex items-center gap-3">
                <div className="text-brun">{cat.icon}</div>
                <h2 className="font-display text-2xl text-ebene">{cat.category}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {cat.items.map((item) => (
                  <details key={item.q} className="group rounded-2xl border border-or/20 bg-white open:border-or/40">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-display text-base text-ebene list-none">
                      {item.q}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="flex-shrink-0 text-or transition-transform duration-300 group-open:rotate-45"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </summary>
                    <div className="border-t border-or/10 px-6 pb-5 pt-4">
                      <p className="text-sm font-light leading-relaxed text-taupe">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-creme border border-or/20 px-8 py-10 text-center">
          <span className="text-2xl text-or" aria-hidden="true">✦</span>
          <p className="mt-3 font-display text-xl text-ebene">Vous n&apos;avez pas trouvé votre réponse ?</p>
          <p className="mt-2 text-sm text-taupe">Notre équipe répond en moins d&apos;une heure.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary inline-flex">
              Nous écrire
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
