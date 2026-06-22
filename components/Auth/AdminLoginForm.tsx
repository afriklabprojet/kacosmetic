"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader, Eye, EyeOff } from "lucide-react"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email ou mot de passe incorrect.")
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-[rgba(250,246,241,0.05)] px-3.5 py-3 text-sm text-[#FAF6F1] placeholder:text-[rgba(250,246,241,0.22)] outline-none transition-all duration-200 ease-out " +
    "focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]/60 " +
    "border-[rgba(201,168,76,0.18)] hover:border-[rgba(201,168,76,0.32)]"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="block text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "rgba(201,168,76,0.7)" }}
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="admin@kacosmetic.ci"
          className={inputBase}
        />
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <label
          htmlFor="admin-password"
          className="block text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "rgba(201,168,76,0.7)" }}
        >
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputBase} pr-11`}
          />
          <button
            type="button"
            aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-[rgba(250,246,241,0.3)] transition-colors duration-150 ease-out hover:text-[rgba(250,246,241,0.65)] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/40"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-xs text-red-400"
        >
          {error}
        </div>
      )}

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="relative mt-1 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg py-3 text-sm font-semibold tracking-wide transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #D4A820 50%, #B8922E 100%)",
          color: "#1A0A00",
          boxShadow: "0 4px 16px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.2)"
            e.currentTarget.style.transform = "translateY(-1px)"
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          e.currentTarget.style.transform = "translateY(0)"
        }}
      >
        {loading ? (
          <Loader size={16} className="animate-spin" aria-label="Connexion en cours…" />
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  )
}
