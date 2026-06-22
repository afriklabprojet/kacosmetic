import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(3000),
})

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "contact", LIMITS.contact)
  if (rl) return rl

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, email, subject, message } = result.data

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>")

  const apiKey = process.env.RESEND_API_KEY
  const supportEmail = process.env.SUPPORT_EMAIL ?? "contact@kacosmetic.ci"

  if (!apiKey) {
    return NextResponse.json({ success: true })
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    await Promise.allSettled([
      // Notification interne
      resend.emails.send({
        from: process.env.EMAIL_FROM ?? "commandes@kacosmetic.ci",
        to: supportEmail,
        subject: `[Contact] ${subject} — ${name}`,
        html: `
          <h3>Nouveau message de contact</h3>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <hr />
          <p>${escapeHtml(message)}</p>
        `,
        replyTo: email,
      }),
      // Accusé de réception au client
      resend.emails.send({
        from: process.env.EMAIL_FROM ?? "commandes@kacosmetic.ci",
        to: email,
        subject: "Votre message a bien été reçu — Ka Cosmetic",
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais (généralement sous 24h).</p>
          <blockquote style="border-left:3px solid #C9A227;padding-left:12px;color:#6B5744">
            <em>${escapeHtml(message)}</em>
          </blockquote>
          <p>— L'équipe Ka Cosmetic ✨</p>
        `,
      }),
    ])
  } catch {
    // Ne pas exposer l'erreur d'email
  }

  return NextResponse.json({ success: true })
}
