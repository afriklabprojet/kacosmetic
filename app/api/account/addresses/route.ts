import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  label:        z.string().max(50).optional(),
  firstName:    z.string().min(1).max(50),
  lastName:     z.string().min(1).max(50),
  phone:        z.string().min(8).max(20),
  street:       z.string().min(1).max(200),
  neighborhood: z.string().max(100).optional(),
  commune:      z.string().min(1).max(100),
  city:         z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  isDefault:    z.boolean().optional(),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().cuid(),
})

async function getAuthedUser(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user.id
}

export async function GET(req: NextRequest) {
  const userId = await getAuthedUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get("id")
  if (!id || !/^c[a-z0-9]{20,}$/.test(id)) {
    return NextResponse.json({ error: "id invalide" }, { status: 400 })
  }

  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== userId) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 })
  }

  return NextResponse.json({ address })
}

export async function POST(req: NextRequest) {
  const userId = await getAuthedUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  const data = result.data

  try {
    const addressData = {
      userId,
      label:        data.label?.trim() || null,
      firstName:    data.firstName.trim(),
      lastName:     data.lastName.trim(),
      phone:        data.phone.trim(),
      street:       data.street.trim(),
      neighborhood: data.neighborhood?.trim() ?? "",
      commune:      data.commune.trim(),
      city:         data.city?.trim() ?? "Abidjan",
      instructions: data.instructions?.trim() || null,
      isDefault:    data.isDefault ?? false,
    }

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } })
      }
      return tx.address.create({ data: addressData })
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthedUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  const { id, isDefault, ...fields } = result.data

  // Vérifier que l'adresse appartient bien à cet utilisateur
  const existing = await prisma.address.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 })
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } })
      }
      return tx.address.update({
        where: { id },
        data: {
          ...fields,
          ...(isDefault !== undefined ? { isDefault } : {}),
        },
      })
    })

    return NextResponse.json({ address: updated })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthedUser(req)
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get("id")
  if (!id || !/^c[a-z0-9]{20,}$/.test(id)) {
    return NextResponse.json({ error: "id invalide" }, { status: 400 })
  }

  // Vérifier que l'adresse appartient bien à cet utilisateur
  const existing = await prisma.address.findUnique({ where: { id }, select: { userId: true } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 })
  }

  try {
    await prisma.address.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
