import type { PaymentMethod } from "@prisma/client"

const JEKO_BASE_URL = "https://api.jeko.africa/partner_api"

// VISA et MASTERCARD ne sont pas supportés nativement par Jeko Africa.
// Ils sont retirés du mapping : une validation en amont doit les rejeter.
const JEKO_PAYMENT_METHOD: Partial<Record<PaymentMethod, string>> = {
  ORANGE_MONEY: "orange",
  MTN_MONEY:    "mtn",
  WAVE:         "wave",
  MOOV_MONEY:   "moov",
  DJAMO:        "djamo",
}

interface InitiatePaymentParams {
  orderId: string
  orderNumber: string
  amountCents: number         // montant en centimes XOF (FCFA × 1)
  method: PaymentMethod
  successUrl: string
  errorUrl: string
}

interface JekoPaymentRequestResponse {
  id: string
  storeId: string
  reference: string
  type: string
  paymentMethod: string
  status: "pending" | "success" | "error"
  errorReason: string | null
  redirectUrl: string
  transaction: unknown | null
}

function jekoHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-KEY":    process.env.JEKO_API_KEY!,
    "X-API-KEY-ID": process.env.JEKO_API_KEY_ID!,
  }
}

export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<{ id: string; redirectUrl: string }> {
  const jekoMethod = JEKO_PAYMENT_METHOD[params.method]
  if (!jekoMethod) {
    throw new Error(`Méthode de paiement non supportée : ${params.method}`)
  }

  const res = await fetch(`${JEKO_BASE_URL}/payment_requests`, {
    method: "POST",
    headers: jekoHeaders(),
    body: JSON.stringify({
      amountCents: params.amountCents,
      currency:    "XOF",
      reference:   params.orderNumber,
      storeId:     process.env.JEKO_STORE_ID!,
      paymentDetails: {
        type: "redirect",
        data: {
          paymentMethod: jekoMethod,
          successUrl:    params.successUrl,
          errorUrl:      params.errorUrl,
        },
      },
    }),
  })

  if (!res.ok) {
    console.error(`[payment] Jeko Africa error ${res.status} for order ${params.orderNumber}`)
    throw new Error("Échec de l'initialisation du paiement")
  }

  const data = (await res.json()) as JekoPaymentRequestResponse
  return { id: data.id, redirectUrl: data.redirectUrl }
}

export async function getPaymentRequestStatus(
  paymentRequestId: string
): Promise<"pending" | "success" | "error"> {
  const res = await fetch(
    `${JEKO_BASE_URL}/payment_requests/${paymentRequestId}`,
    { headers: jekoHeaders(), cache: "no-store" }
  )

  if (!res.ok) throw new Error(`Jeko status error ${res.status}`)

  const data = (await res.json()) as JekoPaymentRequestResponse
  return data.status
}
