import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Notre Histoire — Ka Cosmetic",
  description: "Découvrez l'histoire de Ka Cosmetic, notre philosophie botanique et nos engagements pour une beauté éthique et panafricaine.",
}

const VALEURS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Pureté absolue",
    text: "Chaque formule est soumise à des tests dermatologiques rigoureux. Zéro ingrédient controversé, zéro compromis.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
    title: "Ancrage africain",
    text: "Inspirés des savoirs botaniques ancestraux d'Afrique de l'Ouest, reformulés par des laboratoires de pointe.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: "Cruelty-free",
    text: "Aucun test sur les animaux, jamais. Nos produits sont certifiés cruelty-free et développés dans le respect du vivant.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Science & nature",
    text: "L'alliance de la botanique africaine et de la cosmétologie moderne, pour des résultats visibles en 28 jours.",
  },
]

const TIMELINE = [
  { year: "2018", title: "La genèse", text: "Naissance de Ka Cosmetic dans un laboratoire d'Abidjan, avec la conviction que la beauté africaine méritait ses propres rituels." },
  { year: "2020", title: "Première collection", text: "Lancement de la gamme Éclat Originel, conçue spécifiquement pour les peaux noires et métissées." },
  { year: "2022", title: "Expansion panafricaine", text: "Ouverture de points de vente au Sénégal, au Ghana et en Côte d'Ivoire. Plus de 10 000 clientes fidèles." },
  { year: "2024", title: "Boutique digitale", text: "Lancement de la boutique en ligne avec livraison le jour même à Abidjan et dans les grandes villes africaines." },
]

export default function AProposPage() {
  return (
    <div className="bg-ivoire">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-brun-dark pb-16 pt-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=85&w=2400&auto=format&fit=crop"
            alt="Ka Cosmetic — Atelier beauté"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(107,64,25,0.95) 0%, rgba(107,64,25,0.4) 60%, transparent 100%)" }} aria-hidden="true" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <nav className="mb-6 flex items-center gap-2 text-xs text-ivoire/50" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ivoire">Notre Histoire</span>
          </nav>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-or">La Maison</p>
          <h1 className="font-display text-5xl font-light text-ivoire md:text-7xl">
            Notre Histoire
          </h1>
        </div>
      </section>

      {/* ── Introduction ─────────────────────────────────────── */}
      <section id="histoire" className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20 items-center">
          <div>
            <span className="text-3xl text-or" aria-hidden="true">✦</span>
            <h2 className="mt-4 font-display text-3xl font-light text-ebene md:text-4xl">
              La fée de la perfection
            </h2>
            <p className="mt-5 text-base font-light leading-loose text-taupe">
              Ka Cosmetic est née d'une conviction simple : chaque femme africaine mérite des soins pensés pour elle, par des experts qui comprennent sa peau, son éclat, son héritage.
            </p>
            <p className="mt-4 text-base font-light leading-loose text-taupe">
              Fondée à Abidjan en 2018 par une équipe de dermatologues et de passionnés de botaniques, Ka Cosmetic conjugue les trésors naturels du continent africain et l'excellence des laboratoires européens pour créer des rituels de beauté d'exception.
            </p>
            <p className="mt-4 text-base font-light leading-loose text-taupe">
              Notre nom, <em className="text-brun not-italic font-medium">Ka</em>, évoque le double spirituel dans la cosmologie égyptienne — cette force intérieure qui rayonne et révèle l'essence de chaque être.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1556228578-8d89b6acb68a?q=80&w=1200&auto=format&fit=crop"
              alt="Rituel beauté Ka Cosmetic"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <section className="bg-creme px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Notre parcours</p>
          <h2 className="mb-16 font-display text-3xl font-light text-ebene md:text-5xl">
            Les grandes étapes
          </h2>
          <div className="relative">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-or/25 md:left-1/2" aria-hidden="true" />
            <div className="flex flex-col gap-12">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="relative flex-shrink-0">
                    <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-or bg-creme md:mx-auto" />
                  </div>
                  <div className={`md:w-1/2 pb-2 ${i % 2 === 0 ? "md:pr-16" : "md:pl-16"}`}>
                    <span className="font-mono text-2xl font-bold text-or">{item.year}</span>
                    <h3 className="mt-1 font-display text-xl text-ebene">{item.title}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-taupe">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Philosophie ──────────────────────────────────────── */}
      <section id="philosophie" className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-24">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Philosophie Botanique</p>
        <h2 className="mb-4 font-display text-3xl font-light text-ebene md:text-5xl max-w-2xl">
          La nature au service de votre éclat
        </h2>
        <p className="mb-14 max-w-2xl text-sm font-light leading-relaxed text-taupe">
          Chaque formule Ka Cosmetic est construite autour d'actifs botaniques soigneusement sélectionnés pour leur efficacité prouvée sur les peaux noires et métissées.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { ingredient: "Karité du Burkina", benefit: "Nutrition profonde, protection et assouplissement de l'épiderme." },
            { ingredient: "Huile de Moringa", benefit: "Antioxydante puissante, ralentit le vieillissement cellulaire." },
            { ingredient: "Baobab africain", benefit: "Régénérateur exceptionnel, répare et unifie le teint." },
            { ingredient: "Hibiscus rouge", benefit: "Éclat immédiat et lissage naturel de la surface cutanée." },
          ].map((item) => (
            <div key={item.ingredient} className="rounded-2xl border border-or/20 bg-creme p-6">
              <div className="mb-4 h-1 w-8 rounded-full bg-or" aria-hidden="true" />
              <h3 className="font-display text-lg text-ebene">{item.ingredient}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-taupe">{item.benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Engagements ──────────────────────────────────────── */}
      <section id="engagements" className="bg-creme px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Engagements</p>
          <h2 className="mb-14 font-display text-3xl font-light text-ebene md:text-5xl">Nos valeurs</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((v) => (
              <div key={v.title} className="flex flex-col gap-4">
                <div className="text-brun">{v.icon}</div>
                <h3 className="font-display text-xl text-ebene">{v.title}</h3>
                <p className="text-sm font-light leading-relaxed text-taupe">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8 text-center bg-ivoire">
        <span className="text-3xl text-or" aria-hidden="true">✦</span>
        <h2 className="mt-4 font-display text-2xl font-light text-ebene md:text-3xl">
          Rejoignez l&apos;aventure Ka Cosmetic
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light text-taupe">
          Découvrez des rituels de beauté pensés pour révéler votre éclat naturel.
        </p>
        <Link
          href="/catalogue"
          className="btn-primary mt-8 inline-flex"
        >
          Découvrir la collection
        </Link>
      </section>

    </div>
  )
}
