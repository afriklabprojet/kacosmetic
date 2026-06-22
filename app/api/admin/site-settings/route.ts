import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadRituelMedia } from "@/lib/services/image.service"
import { revalidateTag } from "next/cache"

const RITUEL_KEY = "rituel_section"

const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"])

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const row = await prisma.siteSetting.findUnique({ where: { key: RITUEL_KEY } })
  if (!row) {
    return NextResponse.json({
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1601049541271-6c6a40c6cb95?q=80&w=1600&auto=format&fit=crop",
    })
  }

  return NextResponse.json(JSON.parse(row.value))
}

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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  }

  const isVideo = file.type.startsWith("video/")
  const isImage = file.type.startsWith("image/")

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Type de fichier non supporté" }, { status: 415 })
  }

  if (isImage && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format image non supporté. Utilisez JPEG, PNG ou WebP." },
      { status: 415 }
    )
  }

  if (isVideo && !ALLOWED_VIDEO_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format vidéo non supporté. Utilisez MP4, WebM ou MOV." },
      { status: 415 }
    )
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Le fichier dépasse la limite de ${isVideo ? "50" : "5"} Mo` },
      { status: 413 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, mediaType } = await uploadRituelMedia(buffer, file.type)

    await prisma.siteSetting.upsert({
      where: { key: RITUEL_KEY },
      update: { value: JSON.stringify({ mediaType, url }) },
      create: { key: RITUEL_KEY, value: JSON.stringify({ mediaType, url }) },
    })

    // Invalider le cache homepage pour refléter le nouveau média immédiatement
    revalidateTag("site-settings")

    return NextResponse.json({ mediaType, url }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'upload du média" },
      { status: 500 }
    )
  }
}
