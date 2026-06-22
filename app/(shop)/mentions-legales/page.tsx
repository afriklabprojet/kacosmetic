import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Mentions légales — Ka Cosmetic",
  description: "Mentions légales du site kacosmetic.ci.",
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mb-8">
      <h2 className="font-display mb-3 text-lg font-semibold text-ebene">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-taupe">{children}</div>
    </section>
  )
}

function Row({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[160px] font-medium text-ebene">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function MentionsLegalesPage() {
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

        <Section title="Éditeur du site">
          <div className="space-y-2">
            <Row label="Dénomination" value="Ka Cosmetic" />
            <Row label="Forme juridique" value="Entreprise individuelle" />
            <Row label="Siège social" value="Abidjan, Côte d'Ivoire" />
            <Row label="Email" value={<a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a>} />
            <Row label="Site web" value={<a href="https://kacosmetic.ci" className="text-or hover:underline">kacosmetic.ci</a>} />
          </div>
        </Section>

        <Section title="Directeur de la publication">
          <p>Le directeur de la publication est le représentant légal de Ka Cosmetic.</p>
        </Section>

        <Section title="Hébergement">
          <div className="space-y-2">
            <Row label="Hébergeur" value="Vercel Inc." />
            <Row label="Adresse" value="340 Pine Street, Suite 900, San Francisco, CA 94104, États-Unis" />
            <Row label="Site" value={<a href="https://vercel.com" className="text-or hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>} />
          </div>
        </Section>

        <Section title="Base de données">
          <div className="space-y-2">
            <Row label="Prestataire" value="Neon (PostgreSQL)" />
            <Row label="Site" value={<a href="https://neon.tech" className="text-or hover:underline" target="_blank" rel="noopener noreferrer">neon.tech</a>} />
          </div>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L'ensemble des éléments constituant le site kacosmetic.ci (textes, images, visuels, logo, marque)
            sont la propriété exclusive de Ka Cosmetic et sont protégés par le droit de la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, de ces
            éléments sans autorisation écrite préalable est strictement interdite.
          </p>
        </Section>

        <Section title="Responsabilité">
          <p>
            Ka Cosmetic s'efforce d'assurer l'exactitude des informations publiées sur le site mais ne peut
            garantir leur exhaustivité ni leur mise à jour permanente. Ka Cosmetic ne saurait être tenu
            responsable des dommages directs ou indirects résultant de l'utilisation du site.
          </p>
        </Section>

        <Section title="Liens hypertextes">
          <p>
            Le site peut contenir des liens vers des sites tiers. Ka Cosmetic n'exerce aucun contrôle sur
            ces sites et n'en est pas responsable.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            Pour en savoir plus sur le traitement de vos données personnelles, consultez notre{" "}
            <Link href="/confidentialite" className="text-or hover:underline">politique de confidentialité</Link>.
          </p>
        </Section>

        <Section title="Droit applicable">
          <p>
            Le présent site et ses mentions légales sont soumis au droit ivoirien. Tout litige relatif
            à l'utilisation du site relève de la compétence des tribunaux d'Abidjan.
          </p>
        </Section>

        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>
            Contact :{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">
              contact@kacosmetic.ci
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
