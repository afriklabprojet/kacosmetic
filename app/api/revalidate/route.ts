import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { revalidatePath, revalidateTag } from "next/cache"

const bodySchema = z.object({
  path: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET
  // Reject if secret is not configured or doesn't match — prevents bypass when env var is unset
  if (!configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const providedSecret = req.headers.get("x-revalidate-secret")
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "path or tag required" }, { status: 400 })
  }

  const { tag, path } = parsed.data

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  return NextResponse.json({ error: "path or tag required" }, { status: 400 })
}
