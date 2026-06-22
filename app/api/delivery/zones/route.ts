import { NextResponse } from "next/server"
import { getDeliveryZones } from "@/lib/services/delivery.service"

export const revalidate = 3600

export async function GET() {
  const zones = await getDeliveryZones()
  return NextResponse.json({ zones })
}
