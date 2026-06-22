import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Ka Cosmetic",
  description: "Consultez les conditions générales de vente de Ka Cosmetic.",
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mb-8">
      <h2 className="font-display mb-3 text-lg font-semibold text-ebene">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-taupe">{children}</div>
    </section>
  )
}

export default function CgvPage() {
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

        <Section title="Article 1 — Objet">
          <p>
            Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre
            Ka Cosmetic, dont le siège social est situé à Abidjan, Côte d'Ivoire, et tout client effectuant
            une commande sur le site <strong className="text-ebene">kacosmetic.ci</strong>.
          </p>
          <p>
            Toute commande implique l'acceptation pleine et entière des présentes CGV.
          </p>
        </Section>

        <Section title="Article 2 — Produits">
          <p>
            Ka Cosmetic commercialise des produits cosmétiques premium fabriqués à partir d'ingrédients
            sélectionnés. Les caractéristiques essentielles des produits sont présentées sur chaque fiche produit.
          </p>
          <p>
            Ka Cosmetic se réserve le droit de modifier la composition ou l'apparence de ses produits sans
            préavis, dans le respect des normes en vigueur.
          </p>
        </Section>

        <Section title="Article 3 — Prix">
          <p>
            Les prix sont indiqués en Francs CFA (FCFA), toutes taxes comprises. Ka Cosmetic se réserve le
            droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs
            en vigueur au moment de la validation de la commande.
          </p>
          <p>
            Les frais de livraison sont calculés en fonction de la zone géographique et du mode de livraison
            choisi, et sont indiqués avant la validation finale de la commande.
          </p>
        </Section>

        <Section title="Article 4 — Commande">
          <p>
            Le client sélectionne les produits souhaités, renseigne ses coordonnées de livraison, choisit
            son mode de paiement, puis valide sa commande. Un email de confirmation est envoyé après validation.
          </p>
          <p>
            Ka Cosmetic se réserve le droit d'annuler ou de refuser toute commande en cas de problème de
            stock, de paiement ou de suspicion de fraude.
          </p>
        </Section>

        <Section title="Article 5 — Paiement">
          <p>
            Le paiement s'effectue via les moyens de paiement disponibles sur le site (Orange Money, MTN MoMo,
            Wave, Moov Money, Djamo, Visa, Mastercard), traités de manière sécurisée par Jeko Africa.
          </p>
          <p>
            La commande n'est confirmée qu'après réception effective du paiement.
          </p>
        </Section>

        <Section title="Article 6 — Livraison">
          <p>
            La livraison est effectuée à l'adresse indiquée lors de la commande. Les délais indicatifs sont
            J0 (livraison le jour même sous conditions) et J+1 (livraison le lendemain).
          </p>
          <p>
            Ka Cosmetic ne peut être tenu responsable des retards imputables à des événements extérieurs
            (intempéries, grèves, force majeure).
          </p>
        </Section>

        <Section title="Article 7 — Retours et remboursements">
          <p>
            Tout produit défectueux ou non conforme peut être retourné dans un délai de 7 jours à compter
            de la réception. Le produit doit être intact, non ouvert et dans son emballage d'origine.
          </p>
          <p>
            Pour initier un retour, contactez notre service client via le formulaire de contact ou sur WhatsApp.
            Les frais de retour sont à la charge du client sauf en cas d'erreur de notre part.
          </p>
        </Section>

        <Section title="Article 8 — Données personnelles">
          <p>
            Les données collectées lors de la commande sont nécessaires au traitement de celle-ci et ne sont
            pas transmises à des tiers sans consentement. Consultez notre{" "}
            <Link href="/confidentialite" className="text-or hover:underline">
              politique de confidentialité
            </Link>{" "}
            pour plus d'informations.
          </p>
        </Section>

        <Section title="Article 9 — Droit applicable">
          <p>
            Les présentes CGV sont soumises au droit ivoirien. En cas de litige, les parties s'engagent à
            rechercher une solution amiable avant tout recours judiciaire.
          </p>
        </Section>

        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>
            Pour toute question relative à ces CGV, contactez-nous à{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">
              contact@kacosmetic.ci
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
