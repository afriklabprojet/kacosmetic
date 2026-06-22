import type { Metadata } from "next"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminLoginForm } from "@/components/Auth/AdminLoginForm"
import { AdminStars } from "@/components/Auth/AdminStars"

export const metadata: Metadata = {
  title: "Connexion — Administration Ka Cosmetic",
}

export default async function AdminLoginPage() {
  const session = await auth()

  if (session?.user) {
    const role = (session.user as { role?: string }).role
    redirect(role === "ADMIN" ? "/admin" : "/")
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "#080300" }}
    >
      {/* Fond dégradé radial — ambiance brun nuit profond */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(201,168,76,0.13) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 80% 90%, rgba(139,88,34,0.12) 0%, transparent 55%)," +
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(28,10,0,0.95) 0%, #080300 100%)",
        }}
      />

      {/* Ligne dorée diagonale décorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "60%",
            width: "1px",
            height: "120%",
            background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.18) 35%, rgba(201,168,76,0.08) 65%, transparent 100%)",
            transform: "rotate(-20deg)",
            transformOrigin: "top center",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "25%",
            width: "1px",
            height: "120%",
            background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.08) 40%, rgba(201,168,76,0.14) 70%, transparent 100%)",
            transform: "rotate(15deg)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* Étoiles animées avec respect prefers-reduced-motion */}
      <AdminStars />

      {/* Carte login */}
      <div className="relative z-10 w-full max-w-[380px]">

        {/* Logo + titre */}
        <div className="mb-9 flex flex-col items-center gap-4">
          {/* Médaillon logo */}
          <div
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 35%, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.05) 100%)",
              border: "1px solid rgba(201,168,76,0.28)",
              boxShadow:
                "0 0 0 8px rgba(201,168,76,0.04)," +
                "0 0 32px rgba(201,168,76,0.18)," +
                "inset 0 1px 0 rgba(201,168,76,0.15)",
            }}
          >
            <Image
              src="/logo.png"
              alt="Ka Cosmetic"
              width={64}
              height={64}
              className="h-[64px] w-[64px] object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(73%) sepia(44%) saturate(550%) hue-rotate(4deg) brightness(98%)",
              }}
              priority
            />
          </div>

          <div className="text-center">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: "#C9A84C", letterSpacing: "0.4em" }}
            >
              Ka Cosmetic
            </p>
            <h1
              className="mt-1.5 font-display text-[26px] font-normal leading-tight tracking-wide"
              style={{ color: "#FAF6F1" }}
            >
              Administration
            </h1>
            {/* Séparateur doré */}
            <div className="mx-auto mt-3 flex items-center gap-2">
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5))" }}
              />
              <svg width="10" height="10" viewBox="0 0 20 20" fill="#C9A84C" aria-hidden="true">
                <path d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z" />
              </svg>
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.5), transparent)" }}
              />
            </div>
          </div>
        </div>

        {/* Formulaire — carte verre */}
        <div
          className="rounded-2xl p-7"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(250,246,241,0.04) 50%, rgba(201,168,76,0.05) 100%)",
            border: "1px solid rgba(201,168,76,0.16)",
            backdropFilter: "blur(20px) saturate(150%)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.6)," +
              "0 1px 0 rgba(201,168,76,0.12) inset," +
              "0 -1px 0 rgba(0,0,0,0.3) inset",
          }}
        >
          <AdminLoginForm />
        </div>

        <p
          className="mt-5 text-center text-[11px]"
          style={{ color: "rgba(250,246,241,0.18)", lineHeight: 1.6 }}
        >
          Accès réservé aux administrateurs autorisés
        </p>
      </div>
    </div>
  )
}
