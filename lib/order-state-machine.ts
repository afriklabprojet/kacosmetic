import { OrderStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { generateInvoice } from "@/lib/services/invoice.service"
import {
  notifyOrderConfirmed,
  notifyOrderInDelivery,
  notifyOrderDelivered,
} from "@/lib/services/notification.service"

// Transitions autorisées
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:     ["CONFIRMED", "CANCELLED"],
  CONFIRMED:   ["PREPARING", "CANCELLED"],
  PREPARING:   ["IN_DELIVERY", "CANCELLED"],
  IN_DELIVERY: ["DELIVERED"],
  DELIVERED:   [],
  CANCELLED:   [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  note?: string
): Promise<void> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  if (!canTransition(order.status, to)) {
    throw new Error(`Transition invalide : ${order.status} → ${to}`)
  }

  const timestamps: Record<string, Date> = {}
  const now = new Date()

  if (to === "CONFIRMED")   timestamps.confirmedAt  = now
  if (to === "PREPARING")   timestamps.preparedAt   = now
  if (to === "IN_DELIVERY") timestamps.inDeliveryAt = now
  if (to === "DELIVERED")   timestamps.deliveredAt  = now
  if (to === "CANCELLED")   timestamps.cancelledAt  = now

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: to, ...timestamps },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId, status: to, note },
    }),
  ])

  // Effets de bord post-transition (non-bloquants)
  const customerName = order.user?.name ?? order.guestFirstName ?? "Client"
  const customerEmail = order.user?.email ?? order.guestEmail ?? ""
  const customerPhone = order.user?.phone ?? order.guestPhone ?? ""

  if (!customerEmail && !customerPhone) return

  const notifData = {
    orderNumber: order.orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    total: order.total,
    items: order.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      price: i.unitPrice,
    })),
    deliveryAddress: order.deliveryAddress ?? undefined,
  }

  if (to === "CONFIRMED") {
    // Facture + notification en parallèle, erreurs non-bloquantes
    await Promise.allSettled([
      generateInvoice(orderId).catch((err: unknown) => {
        console.error("[invoice] génération échouée pour", orderId, err)
      }),
      customerEmail || customerPhone
        ? notifyOrderConfirmed(notifData).catch((err: unknown) => {
            console.error("[notify] confirmed échoué pour", orderId, err)
          })
        : Promise.resolve(),
    ])
    return
  }

  if (to === "IN_DELIVERY") {
    await notifyOrderInDelivery({ ...notifData, trackingNote: note }).catch(
      (err: unknown) => {
        console.error("[notify] in_delivery échoué pour", orderId, err)
      }
    )
    return
  }

  if (to === "DELIVERED") {
    await notifyOrderDelivered(notifData).catch((err: unknown) => {
      console.error("[notify] delivered échoué pour", orderId, err)
    })
  }
}
