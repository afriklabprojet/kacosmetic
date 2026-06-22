"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Loader, Mail, Sparkles } from "lucide-react"

function SignInButtonsInner({ defaultCallbackUrl = "/" }: Readonly<{ defaultCallbackUrl?: string }>) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("next") ?? defaultCallbackUrl

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-or/10">
          <Mail size={16} className="text-or" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-ebene">Lien magique</p>
          <p className="text-[11px] text-taupe">Connexion sans mot de passe</p>
        </div>
      </div>
      <MagicLinkForm callbackUrl={callbackUrl} />
    </div>
  )
}

function MagicLinkForm({ callbackUrl }: Readonly<{ callbackUrl: string }>) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await signIn("resend", { email, callbackUrl, redirect: false })
      if (res?.error) {
        setError("Impossible d'envoyer l'email. Vérifiez votre adresse.")
      } else {
        setSent(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-or/25 bg-or/5 px-5 py-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-or/15">
          <Sparkles size={18} className="text-or" strokeWidth={1.5} />
        </div>
        <p className="font-display text-base text-ebene">Vérifiez votre email</p>
        <p className="mt-1 text-[12px] leading-relaxed text-taupe">
          Un lien de connexion a été envoyé à<br />
          <span className="font-medium text-brun">{email}</span>
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-[11px] uppercase tracking-[0.16em] text-taupe/60 underline-offset-2 hover:text-brun hover:underline"
        >
          Utiliser un autre email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-or/25 bg-creme/50 px-4 py-3.5 text-sm text-ebene placeholder:text-taupe/40 transition-colors focus:border-or/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-or/15"
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-erreur/5 px-3 py-2 text-[12px] text-erreur">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="group relative w-full overflow-hidden rounded-xl bg-brun py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-ivoire transition-all duration-300 hover:bg-brun-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`}>
          Recevoir mon lien
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader size={16} className="animate-spin" />
          </span>
        )}
      </button>
    </form>
  )
}

export function SignInButtons({ callbackUrl }: Readonly<{ callbackUrl?: string }>) {
  return (
    <Suspense fallback={<div className="space-y-4"><div className="skeleton h-14 rounded-xl" /><div className="skeleton h-12 rounded-xl" /></div>}>
      <SignInButtonsInner defaultCallbackUrl={callbackUrl} />
    </Suspense>
  )
}
