import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SignInButtons } from "@/components/Auth/SignInButtons"

export const metadata: Metadata = {
  title: "Inscription — Ka Cosmetic",
  robots: { index: false },
}

const PERKS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    text: "Offres & réductions exclusives membres",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
      </svg>
    ),
    text: "Suivi de commandes en temps réel",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    text: "Liste de souhaits & favoris sauvegardés",
  },
]

export default function InscriptionPage() {
  return (
    <div className="flex min-h-screen">

      {/* ── Panneau image éditorial (desktop uniquement) ─── */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop"
          alt="Beauté Ka Cosmetic"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(31,10,0,0.60) 0%, rgba(31,10,0,0.10) 100%)" }}
          aria-hidden="true"
        />

        {/* Avantages overlay */}
        <div className="absolute bottom-12 left-10 right-10">
          <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
            Le Cercle Ka
          </span>
          <p className="font-display text-3xl font-light leading-snug text-white">
            Rejoignez<br />
            <em className="text-or not-italic">notre univers</em>
          </p>
          <ul className="mt-6 space-y-3">
            {PERKS.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-or/20 text-or">
                  {perk.icon}
                </span>
                <span className="text-sm font-light text-white/80">{perk.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="absolute left-10 top-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-or"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Accueil
        </Link>
      </div>

      {/* ── Panneau formulaire ─────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center bg-ivoire px-6 py-12 pt-24 lg:justify-center lg:pt-12">
        <div className="w-full max-w-[360px]">

          {/* Retour mobile */}
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-taupe transition-colors hover:text-brun lg:hidden"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Retour
          </Link>

          {/* Logo + titre */}
          <div className="mb-10 text-center">
            <Link href="/" aria-label="Ka Cosmetic — Accueil">
              <Image
                src="/logo.png"
                alt="Ka Cosmetic"
                width={72}
                height={80}
                priority
                className="mx-auto mb-5"
                style={{ width: "72px", height: "auto" }}
              />
            </Link>
            <h1 className="font-display text-3xl font-light text-ebene">
              Bienvenue
            </h1>
            <p className="mt-2 text-sm font-light text-taupe">
              Créez votre compte et accédez à l&apos;univers Ka Cosmetic.
            </p>
          </div>

          {/* Avantages mobiles */}
          <ul className="mb-6 space-y-2 lg:hidden">
            {PERKS.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-or/10 text-or">
                  {perk.icon}
                </span>
                <span className="text-[12px] text-taupe">{perk.text}</span>
              </li>
            ))}
          </ul>

          {/* Carte formulaire */}
          <div className="rounded-2xl border border-or/20 bg-white px-8 py-8 shadow-[0_4px_32px_rgba(31,31,31,0.06)]">
            <SignInButtons />
          </div>

          {/* CGV */}
          <p className="mt-6 text-center text-[11px] leading-relaxed text-taupe/70">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgv" className="text-brun underline-offset-2 hover:underline">
              conditions générales
            </Link>
            {" "}et notre{" "}
            <Link href="/cgv" className="text-brun underline-offset-2 hover:underline">
              politique de confidentialité
            </Link>.
          </p>

          {/* Déjà un compte */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 border-t border-or/15" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-taupe/50">Déjà membre ?</span>
            <div className="flex-1 border-t border-or/15" />
          </div>
          <p className="mt-4 text-center text-sm text-taupe">
            <Link href="/connexion" className="font-medium text-brun underline-offset-2 hover:underline">
              Se connecter à mon compte
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
