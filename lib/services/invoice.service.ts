import { v2 as cloudinary } from "cloudinary"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer"
import { createElement } from "react"
import type { Invoice } from "@prisma/client"
import { prisma } from "@/lib/prisma"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ─── Types ───────────────────────────────────────────────────

interface InvoiceData {
  invoiceNumber:   string
  issuedAt:        Date
  customerName:    string
  customerEmail:   string
  customerPhone:   string
  deliveryAddress: string
  deliveryCommune: string
  items: Array<{
    productName: string
    variantName: string
    sku:         string
    quantity:    number
    unitPrice:   number
    total:       number
  }>
  subtotal:    number
  deliveryFee: number
  discount:    number
  total:       number
}

// ─── Helpers ─────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA"
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  })
}

// ─── Styles ──────────────────────────────────────────────────

const BRAND_DARK   = "#1A0A00"
const BRAND_GOLD   = "#C9A84C"
const BRAND_LIGHT  = "#FAF6F1"
const BRAND_MUTED  = "#8B6A4A"
const BRAND_BORDER = "#E8DDD0"

const s = StyleSheet.create({
  page: { backgroundColor: BRAND_LIGHT, padding: "32px 40px", fontFamily: "Helvetica", fontSize: 10, color: BRAND_DARK },

  // Header
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: BRAND_GOLD, paddingBottom: 16, marginBottom: 24 },
  brandName:    { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 2, textTransform: "uppercase" },
  brandTagline: { fontSize: 8, color: BRAND_GOLD, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 },
  invoiceMeta:  { alignItems: "flex-end" },
  invoiceLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: BRAND_GOLD, fontFamily: "Helvetica-Bold" },
  invoiceNum:   { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 3 },
  invoiceDate:  { fontSize: 9, color: BRAND_MUTED, marginTop: 4 },

  // Section title
  sectionTitle: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: BRAND_GOLD, fontFamily: "Helvetica-Bold", marginBottom: 6 },

  // Client block
  clientBox:   { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND_BORDER, borderRadius: 4, padding: "12px 16px", marginBottom: 20 },
  clientGrid:  { flexDirection: "row", flexWrap: "wrap" },
  clientCell:  { width: "50%", marginBottom: 8 },
  clientLabel: { fontSize: 8, color: BRAND_MUTED, textTransform: "uppercase", letterSpacing: 0.8 },
  clientValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },

  // Table header
  tableHead: { flexDirection: "row", backgroundColor: BRAND_DARK, borderRadius: 3, marginBottom: 0 },
  thProduct: { flex: 3, color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, padding: "7px 8px" },
  thSku:     { flex: 2, color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, padding: "7px 8px" },
  thQty:     { flex: 1, color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, padding: "7px 8px", textAlign: "center" },
  thPrice:   { flex: 2, color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, padding: "7px 8px", textAlign: "right" },
  thTotal:   { flex: 2, color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 1, padding: "7px 8px", textAlign: "right" },

  // Table rows
  rowEven: { flexDirection: "row", backgroundColor: "#FFFFFF" },
  rowOdd:  { flexDirection: "row", backgroundColor: BRAND_LIGHT },
  tdProduct: { flex: 3, padding: "8px" },
  tdSku:     { flex: 2, padding: "8px", color: BRAND_MUTED, fontSize: 9 },
  tdQty:     { flex: 1, padding: "8px", textAlign: "center" },
  tdPrice:   { flex: 2, padding: "8px", textAlign: "right", fontFamily: "Helvetica-Bold" },
  tdTotal:   { flex: 2, padding: "8px", textAlign: "right", fontFamily: "Helvetica-Bold" },
  variantText: { fontSize: 8, color: BRAND_MUTED, marginTop: 2 },
  tableBorder: { borderBottomWidth: 2, borderBottomColor: BRAND_GOLD, marginBottom: 20 },

  // Summary
  summaryWrapper: { alignItems: "flex-end", marginBottom: 32 },
  summaryBox:     { width: 220, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND_BORDER, borderRadius: 4 },
  summaryRow:     { flexDirection: "row", justifyContent: "space-between", padding: "7px 12px", borderBottomWidth: 1, borderBottomColor: BRAND_BORDER },
  summaryLabel:   { color: BRAND_MUTED },
  summaryValue:   { fontFamily: "Helvetica-Bold" },
  discountValue:  { fontFamily: "Helvetica-Bold", color: "#2E7D32" },
  totalRow:       { flexDirection: "row", justifyContent: "space-between", padding: "9px 12px", backgroundColor: BRAND_DARK, borderRadius: "0 0 4px 4px" },
  totalLabel:     { color: BRAND_LIGHT, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, fontSize: 10 },
  totalValue:     { color: BRAND_GOLD, fontFamily: "Helvetica-Bold", fontSize: 12 },

  // Footer
  footer:     { borderTopWidth: 1, borderTopColor: BRAND_BORDER, paddingTop: 12, textAlign: "center", fontSize: 9, color: BRAND_MUTED },
  footerBold: { fontFamily: "Helvetica-Bold", color: BRAND_DARK },
})

// ─── PDF Document (React-PDF) ─────────────────────────────────

function InvoicePdf({ data }: { data: InvoiceData }) {
  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: s.page },

      // Header
      createElement(
        View,
        { style: s.header },
        createElement(
          View,
          {},
          createElement(Text, { style: s.brandName }, "Ka Cosmetic"),
          createElement(Text, { style: s.brandTagline }, "Beauté naturelle africaine")
        ),
        createElement(
          View,
          { style: s.invoiceMeta },
          createElement(Text, { style: s.invoiceLabel }, "Facture"),
          createElement(Text, { style: s.invoiceNum }, data.invoiceNumber),
          createElement(Text, { style: s.invoiceDate }, `Émise le ${formatDate(data.issuedAt)}`)
        )
      ),

      // Client info
      createElement(Text, { style: s.sectionTitle }, "Informations client"),
      createElement(
        View,
        { style: s.clientBox },
        createElement(
          View,
          { style: s.clientGrid },
          ...([
            ["Nom",                  data.customerName],
            ["Email",                data.customerEmail],
            ["Téléphone",            data.customerPhone],
            ["Adresse de livraison", `${data.deliveryAddress}, ${data.deliveryCommune}`],
          ] as [string, string][]).map(([label, value]) =>
            createElement(
              View,
              { style: s.clientCell, key: label },
              createElement(Text, { style: s.clientLabel }, label),
              createElement(Text, { style: s.clientValue }, value)
            )
          )
        )
      ),

      // Items table
      createElement(Text, { style: s.sectionTitle }, "Articles commandés"),
      createElement(
        View,
        { style: s.tableHead },
        createElement(Text, { style: s.thProduct }, "Produit"),
        createElement(Text, { style: s.thSku },     "SKU"),
        createElement(Text, { style: s.thQty },     "Qté"),
        createElement(Text, { style: s.thPrice },   "Prix unit."),
        createElement(Text, { style: s.thTotal },   "Total")
      ),
      ...data.items.map((item, i) =>
        createElement(
          View,
          { style: i % 2 === 0 ? s.rowEven : s.rowOdd, key: item.sku },
          createElement(
            View,
            { style: s.tdProduct },
            createElement(Text, {}, item.productName),
            createElement(Text, { style: s.variantText }, item.variantName)
          ),
          createElement(Text, { style: s.tdSku },   item.sku),
          createElement(Text, { style: s.tdQty },   String(item.quantity)),
          createElement(Text, { style: s.tdPrice }, formatPrice(item.unitPrice)),
          createElement(Text, { style: s.tdTotal }, formatPrice(item.total))
        )
      ),
      createElement(View, { style: s.tableBorder }),

      // Summary
      createElement(
        View,
        { style: s.summaryWrapper },
        createElement(
          View,
          { style: s.summaryBox },
          createElement(
            View,
            { style: s.summaryRow },
            createElement(Text, { style: s.summaryLabel }, "Sous-total"),
            createElement(Text, { style: s.summaryValue }, formatPrice(data.subtotal))
          ),
          createElement(
            View,
            { style: s.summaryRow },
            createElement(Text, { style: s.summaryLabel }, "Livraison"),
            createElement(Text, { style: s.summaryValue }, formatPrice(data.deliveryFee))
          ),
          ...(data.discount > 0
            ? [createElement(
                View,
                { style: s.summaryRow, key: "discount" },
                createElement(Text, { style: s.summaryLabel }, "Réduction"),
                createElement(Text, { style: s.discountValue }, `− ${formatPrice(data.discount)}`)
              )]
            : []),
          createElement(
            View,
            { style: s.totalRow },
            createElement(Text, { style: s.totalLabel }, "Total"),
            createElement(Text, { style: s.totalValue }, formatPrice(data.total))
          )
        )
      ),

      // Footer
      createElement(
        View,
        { style: s.footer },
        createElement(Text, {}, [
          "Ka Cosmetic",
          " — Abidjan, Côte d'Ivoire\n",
          `Ce document tient lieu de facture pour votre commande ${data.invoiceNumber}.`,
        ].join(""))
      )
    )
  )
}

// ─── PDF generation (serverless-safe) ────────────────────────

async function generatePdfBuffer(data: InvoiceData): Promise<Buffer> {
  // InvoicePdf() returns a Document element — call directly (not createElement wrapper)
  const doc = InvoicePdf({ data })
  return renderToBuffer(doc as Parameters<typeof renderToBuffer>[0])
}

// ─── Cloudinary upload ───────────────────────────────────────

interface CloudinaryUploadResult {
  secure_url: string
}

function uploadPdfToCloudinary(
  buffer: Buffer,
  publicId: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: publicId, format: "pdf" },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Cloudinary upload returned no result"))
          if (!result.secure_url) return reject(new Error("Cloudinary upload returned no secure_url"))
          resolve({ secure_url: result.secure_url })
        }
      )
      .end(buffer)
  })
}

// ─── Public API ──────────────────────────────────────────────

export async function generateInvoice(orderId: string): Promise<Invoice> {
  let order: Awaited<ReturnType<typeof fetchOrder>>
  try {
    order = await fetchOrder(orderId)
  } catch (err) {
    throw new Error(`Invoice generation failed — order fetch error: ${getErrorMessage(err)}`)
  }

  if (order.invoice) return order.invoice

  const issuedAt        = new Date()
  const customerName    = resolveCustomerName(order)
  const customerEmail   = order.guestEmail ?? order.user?.email ?? ""
  const customerPhone   = order.guestPhone ?? ""
  const deliveryAddress = order.deliveryAddress ?? ""
  const deliveryCommune = order.deliveryCommune ?? ""

  const invoiceData: InvoiceData = {
    invoiceNumber: order.orderNumber,
    issuedAt,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    deliveryCommune,
    items:       order.items,
    subtotal:    order.subtotal,
    deliveryFee: order.deliveryFee,
    discount:    order.discount,
    total:       order.total,
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generatePdfBuffer(invoiceData)
  } catch (err) {
    throw new Error(`Invoice generation failed — PDF error: ${getErrorMessage(err)}`)
  }

  const year     = issuedAt.getFullYear()
  const seq      = order.orderNumber.split("-")[2] ?? "0000"
  const publicId = `invoices/KA-${year}-${seq}`

  let pdfUrl: string
  try {
    const uploaded = await uploadPdfToCloudinary(pdfBuffer, publicId)
    pdfUrl = uploaded.secure_url
  } catch (err) {
    throw new Error(`Invoice generation failed — Cloudinary upload error: ${getErrorMessage(err)}`)
  }

  try {
    return await prisma.invoice.create({
      data: { orderId, invoiceNumber: order.orderNumber, pdfUrl, issuedAt },
    })
  } catch (err) {
    throw new Error(`Invoice generation failed — database error: ${getErrorMessage(err)}`)
  }
}

// ─── Private helpers ─────────────────────────────────────────

type OrderWithRelations = NonNullable<Awaited<ReturnType<typeof fetchOrder>>>

async function fetchOrder(orderId: string) {
  return prisma.order.findUniqueOrThrow({
    where:   { id: orderId },
    include: { items: true, user: { select: { name: true, email: true, phone: true } }, invoice: true },
  })
}

function resolveCustomerName(order: OrderWithRelations): string {
  if (order.guestFirstName ?? order.guestLastName) {
    return `${order.guestFirstName ?? ""} ${order.guestLastName ?? ""}`.trim()
  }
  return order.user?.name ?? "Client"
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}
