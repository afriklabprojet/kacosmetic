"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle, Clock, XCircle, Loader } from "lucide-react"

interface PaymentStatusPollerProps {
  orderId: string
  initialStatus: string
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente de paiement",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  IN_DELIVERY: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
}

const TERMINAL_STATUSES = new Set(["CONFIRMED", "PREPARING", "IN_DELIVERY", "DELIVERED", "CANCELLED"])
const POLL_INTERVAL_MS = 5_000
const MAX_POLLS = 120 // 10 minutes

interface PollResponse {
  orderStatus: string
  paymentStatus: string
}

export default function PaymentStatusPoller({ orderId, initialStatus }: PaymentStatusPollerProps) {
  const [status, setStatus] = useState(initialStatus)
  const [polling, setPolling] = useState(initialStatus === "PENDING")
  const pollCount = useRef(0)

  useEffect(() => {
    if (!polling) return

    const controller = new AbortController()

    async function poll() {
      if (pollCount.current >= MAX_POLLS) {
        setPolling(false)
        setStatus((prev) => prev === "PENDING" ? "TIMEOUT" : prev)
        return
      }

      pollCount.current += 1

      try {
        const timeoutId = setTimeout(() => controller.abort(), 8_000)
        const res = await fetch(`/api/payment/status?orderId=${orderId}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        if (!res.ok) return

        const data = await res.json() as PollResponse
        const nextStatus = data.orderStatus

        if (nextStatus && nextStatus !== status) setStatus(nextStatus)

        if (TERMINAL_STATUSES.has(nextStatus)) {
          setPolling(false)
        }
      } catch {
        // ignore abort or transient network errors, will retry
      }
    }

    void poll()
    const timer = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [orderId, polling])

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        <Loader size={13} className="animate-spin" />
        {STATUS_LABEL.PENDING}
      </div>
    )
  }

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
        <XCircle size={13} />
        {STATUS_LABEL.CANCELLED}
      </div>
    )
  }

  if (status === "CONFIRMED" || status === "PREPARING" || status === "IN_DELIVERY" || status === "DELIVERED") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
        <CheckCircle size={13} />
        {STATUS_LABEL[status] ?? status}
      </div>
    )
  }

  if (status === "TIMEOUT") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        <Clock size={13} />
        En attente — <a href="/contact" className="underline">Contacter le support</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-or/10 px-3 py-1.5 text-xs font-medium text-or">
      <Clock size={13} />
      {STATUS_LABEL[status] ?? status}
    </div>
  )
}
