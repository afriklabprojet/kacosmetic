import { Resend } from "resend"
import twilio from "twilio"

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "")
  return _resend
}

let _twilio: ReturnType<typeof twilio> | null = null
function getTwilio(): ReturnType<typeof twilio> {
  if (!_twilio) {
    _twilio = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  }
  return _twilio
}

// ─── Types ───────────────────────────────────────────────────

interface OrderNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  deliveryAddress?: string
  trackingNote?: string
}

// ─── Email ───────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await getResend().emails.send({
    from: process.env.EMAIL_FROM ?? "commandes@kacosmetic.ci",
    to,
    subject,
    html,
  })
}

// ─── SMS ─────────────────────────────────────────────────────

async function sendSms(to: string, body: string): Promise<void> {
  await getTwilio().messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body,
  })
}

// ─── WhatsApp ────────────────────────────────────────────────

async function sendWhatsapp(to: string, message: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_API_TOKEN
  const url = `${process.env.WHATSAPP_API_URL}/v1/${phoneNumberId}/messages`

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""),
      type: "text",
      text: { body: message },
    }),
  })
}

// ─── Notifications métier ────────────────────────────────────

export async function notifyOrderConfirmed(data: OrderNotificationData): Promise<void> {
  const itemsHtml = data.items
    .map((i) => `<li>${i.name} × ${i.quantity} — ${i.price.toLocaleString("fr-CI")} FCFA</li>`)
    .join("")

  await Promise.allSettled([
    sendEmail(
      data.customerEmail,
      `✅ Commande ${data.orderNumber} confirmée — Ka Cosmetic`,
      `<h2>Bonjour ${data.customerName},</h2>
       <p>Votre commande <strong>${data.orderNumber}</strong> a été confirmée et est en cours de préparation.</p>
       <ul>${itemsHtml}</ul>
       <p><strong>Total : ${data.total.toLocaleString("fr-CI")} FCFA</strong></p>
       <p>Nous vous notifions dès la prise en charge par notre livreur.</p>
       <p>— L'équipe Ka Cosmetic ✨</p>`
    ),
    sendSms(
      data.customerPhone,
      `Ka Cosmetic ✅ Commande ${data.orderNumber} confirmée. Total : ${data.total.toLocaleString("fr-CI")} FCFA. Nous préparons votre colis !`
    ),
    sendWhatsapp(
      data.customerPhone,
      `✅ *Commande confirmée — Ka Cosmetic*\n\nBonjour ${data.customerName} !\nVotre commande *${data.orderNumber}* est confirmée.\nMontant : *${data.total.toLocaleString("fr-CI")} FCFA*\nNous vous informons dès la mise en livraison. 🛍️`
    ),
  ])
}

export async function notifyOrderInDelivery(data: OrderNotificationData): Promise<void> {
  await Promise.allSettled([
    sendEmail(
      data.customerEmail,
      `🚚 Commande ${data.orderNumber} en route — Ka Cosmetic`,
      `<h2>C'est parti ${data.customerName} !</h2>
       <p>Votre commande <strong>${data.orderNumber}</strong> est prise en charge par notre livreur.</p>
       <p>Adresse : ${data.deliveryAddress}</p>
       <p>${data.trackingNote ?? "Livraison prévue dans les prochaines heures."}</p>
       <p>— L'équipe Ka Cosmetic ✨</p>`
    ),
    sendSms(
      data.customerPhone,
      `Ka Cosmetic 🚚 Votre commande ${data.orderNumber} est en route ! ${data.trackingNote ?? "Livraison prévue très bientôt."}`
    ),
    sendWhatsapp(
      data.customerPhone,
      `🚚 *En route — Ka Cosmetic*\n\nBonjour ${data.customerName} !\nVotre commande *${data.orderNumber}* est en cours de livraison.\n${data.trackingNote ?? "Notre livreur arrive bientôt !"} 📦`
    ),
  ])
}

export async function notifyOrderDelivered(data: OrderNotificationData): Promise<void> {
  await Promise.allSettled([
    sendEmail(
      data.customerEmail,
      `🎉 Commande ${data.orderNumber} livrée — Ka Cosmetic`,
      `<h2>Merci ${data.customerName} !</h2>
       <p>Votre commande <strong>${data.orderNumber}</strong> a bien été livrée.</p>
       <p>Nous espérons que vous adorez vos produits Ka Cosmetic ✨</p>
       <p>Laissez-nous un avis pour aider la communauté !</p>
       <p>— L'équipe Ka Cosmetic</p>`
    ),
    sendSms(
      data.customerPhone,
      `Ka Cosmetic 🎉 Commande ${data.orderNumber} livrée ! Profitez bien de vos produits. Merci de votre confiance ✨`
    ),
    sendWhatsapp(
      data.customerPhone,
      `🎉 *Livrée — Ka Cosmetic*\n\nBonjour ${data.customerName} !\nVotre commande *${data.orderNumber}* a bien été livrée. Nous espérons que vous adorez vos produits ! 💛`
    ),
  ])
}

export async function notifyAbandonedCart(
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  cartValue: number
): Promise<void> {
  await Promise.allSettled([
    sendEmail(
      customerEmail,
      "Vous avez oublié quelque chose 🛒 — Ka Cosmetic",
      `<h2>Bonjour ${customerName},</h2>
       <p>Vous avez laissé des produits dans votre panier (${cartValue.toLocaleString("fr-CI")} FCFA).</p>
       <p><a href="https://kacosmetic.ci/panier">Reprendre ma commande →</a></p>
       <p>— L'équipe Ka Cosmetic ✨</p>`
    ),
    sendWhatsapp(
      customerPhone,
      `🛒 *Ka Cosmetic*\n\nBonjour ${customerName} ! Vous avez laissé *${cartValue.toLocaleString("fr-CI")} FCFA* de produits dans votre panier.\nComplétez votre commande : kacosmetic.ci/panier 💛`
    ),
  ])
}
