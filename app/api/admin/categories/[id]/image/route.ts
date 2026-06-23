import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { uploadCategoryImage } from "@/lib/services/image.service"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true, slug: true } })
  if (!category) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 })

  let formData: FormData
  try { formData = await req.formData() } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Fichier trop lourd (max 5 Mo)" }, { status: 413 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Format non supporté (JPEG, PNG, WebP)" }, { status: 415 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const { url } = await uploadCategoryImage(buffer, category.slug)

  await prisma.category.update({ where: { id }, data: { imageUrl: url } })

  revalidateTag("categories")

  return NextResponse.json({ url }, { status: 200 })
}
