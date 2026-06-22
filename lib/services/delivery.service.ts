import { prisma } from "@/lib/prisma"
import type { DeliveryType } from "@prisma/client"

export async function getDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
}

export async function getZoneForCommune(commune: string) {
  const lower = commune.toLowerCase()
  const zones = await prisma.deliveryZone.findMany({ where: { isActive: true } })
  return zones.find((z) => z.communes.some((c) => c.toLowerCase() === lower)) ?? null
}

export function getDeliveryPrice(
  zone: { priceJ0: number; priceJ1: number },
  type: DeliveryType
): number {
  return type === "J0" ? zone.priceJ0 : zone.priceJ1
}

export function getEstimatedDelivery(type: DeliveryType): string {
  if (type === "J0") return "Aujourd'hui (commande avant 14h)"
  return "Demain"
}
