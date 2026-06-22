import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadProductImage } from "@/lib/services/image.service"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 })
  }

  const file = formData.get("file")
  const productSlug = formData.get("productSlug")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  }

  if (typeof productSlug !== "string" || !productSlug.trim()) {
    return NextResponse.json({ error: "productSlug manquant" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la limite de 5 Mo" },
      { status: 413 }
    )
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté. Utilisez JPEG, PNG ou WebP." },
      { status: 415 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, blurHash } = await uploadProductImage(buffer, productSlug.trim())
    return NextResponse.json({ url, blurHash }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    )
  }
}
