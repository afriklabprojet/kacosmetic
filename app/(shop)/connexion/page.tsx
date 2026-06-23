import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SignInButtons } from "@/components/Auth/SignInButtons"

export const metadata: Metadata = {
  title: "Connexion — Ka Cosmetic",
  robots: { index: false },
}

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen">

      {/* ── Panneau image éditorial (desktop uniquement) ─── */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1400&auto=format&fit=crop"
          alt="Rituel beauté Ka Cosmetic"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        {/* Voile dégradé */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(31,10,0,0.55) 0%, rgba(31,10,0,0.15) 100%)" }}
          aria-hidden="true"
        />
        {/* Branding bas gauche */}
        <div className="absolute bottom-12 left-10 right-10">
          <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
            Ka Cosmetic
          </span>
          <p className="font-display text-3xl font-light leading-snug text-white">
            La fée<br />
            <em className="text-or not-italic">de la perfection</em>
          </p>
          <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
            Rituels de beauté fondés sur les secrets<br />
            ancestraux africains et la science botanique.
          </p>
        </div>
        {/* Lien retour accueil */}
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

        {/* Logo + titre */}
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
              Bon retour
            </h1>
            <p className="mt-2 text-sm font-light text-taupe">
              Entrez votre email pour recevoir un lien de connexion instantané.
            </p>
          </div>

          {/* Carte formulaire */}
          <div className="rounded-2xl border border-or/20 bg-white px-8 py-8 shadow-[0_4px_32px_rgba(31,31,31,0.06)]">
            <SignInButtons />
          </div>

          {/* CGV */}
          <p className="mt-6 text-center text-[11px] leading-relaxed text-taupe/70">
            En continuant, vous acceptez nos{" "}
            <Link href="/cgv" className="text-brun underline-offset-2 hover:underline">
              conditions générales
            </Link>
            {" "}et notre{" "}
            <Link href="/confidentialite" className="text-brun underline-offset-2 hover:underline">
              politique de confidentialité
            </Link>.
          </p>

          {/* Nouveau client */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 border-t border-or/15" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-taupe/50">Nouveau ?</span>
            <div className="flex-1 border-t border-or/15" />
          </div>
          <p className="mt-4 text-center text-sm text-taupe">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-medium text-brun underline-offset-2 hover:underline">
              Créer un compte
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
