import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { applyRateLimitAsync, LIMITS } from "@/lib/rate-limit"

const schema = z.object({
  email: z.string().email().max(255),
})

export async function POST(req: NextRequest) {
  const rl = await applyRateLimitAsync(req, "newsletter", LIMITS.newsletter)
  if (rl) return rl

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 422 })
  }

  const { email } = result.data

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: true })
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (audienceId) {
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      })
    }
  } catch {
    // Ne pas bloquer l'utilisateur sur une erreur d'inscription
  }

  return NextResponse.json({ success: true })
}
