import { prisma } from "../lib/prisma"
import { seedBienvenue10Coupon } from "../lib/services/coupon.service"

const CATEGORIES = [
  { name: "Soins Visage",  slug: "soins-visage",  sortOrder: 1 },
  { name: "Corps & Bain",  slug: "corps-bain",     sortOrder: 2 },
  { name: "Maquillage",    slug: "maquillage",     sortOrder: 3 },
  { name: "Parfums",       slug: "parfums",        sortOrder: 4 },
  { name: "Coffrets",      slug: "coffrets",       sortOrder: 5 },
]

const DELIVERY_ZONES = [
  {
    name: "Plateau / Cocody",
    communes: ["Plateau", "Cocody", "Bingerville"],
    priceJ0: 1500,
    priceJ1: 1000,
  },
  {
    name: "Marcory / Treichville",
    communes: ["Marcory", "Treichville", "Port-Bouet"],
    priceJ0: 1500,
    priceJ1: 1000,
  },
  {
    name: "Adjamé / Abobo",
    communes: ["Adjamé", "Abobo", "Anyama"],
    priceJ0: 2000,
    priceJ1: 1500,
  },
  {
    name: "Yopougon",
    communes: ["Yopougon"],
    priceJ0: 2000,
    priceJ1: 1500,
  },
  {
    name: "Koumassi / Attécoubé",
    communes: ["Koumassi", "Attécoubé"],
    priceJ0: 1500,
    priceJ1: 1000,
  },
]

async function main() {
  console.log("🌱 Seeding Ka Cosmetic database...")

  // Catégories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log("✅ Catégories créées")

  // Zones de livraison
  for (const zone of DELIVERY_ZONES) {
    await prisma.deliveryZone.upsert({
      where: { id: zone.name },
      update: {},
      create: zone,
    })
  }
  console.log("✅ Zones de livraison créées")

  // Coupon BIENVENUE10
  await seedBienvenue10Coupon()
  console.log("✅ Coupon BIENVENUE10 créé")

  // Produit de démo
  const category = await prisma.category.findUnique({
    where: { slug: "soins-visage" },
  })

  if (category) {
    const product = await prisma.product.upsert({
      where: { slug: "serum-eclat-ka" },
      update: {},
      create: {
        name:        "Sérum Éclat Ka",
        slug:        "serum-eclat-ka",
        description: "Sérum concentré à la vitamine C pour un teint lumineux et unifié. Formule légère absorbée en quelques secondes.",
        ingredients: "Ascorbic Acid 15%, Niacinamide, Hyaluronic Acid, Aloe Vera.",
        howToUse:    "Appliquer 2 à 3 gouttes sur un visage propre matin et soir, avant l'hydratant.",
        categoryId:  category.id,
        isFeatured:  true,
        isActive:    true,
      },
    })

    await prisma.productVariant.upsert({
      where: { sku: "KA-SERUM-30ML" },
      update: {},
      create: {
        productId:    product.id,
        name:         "30 ml",
        sku:          "KA-SERUM-30ML",
        price:        18500,
        comparePrice: 22000,
        stock:        50,
        isActive:     true,
      },
    })

    await prisma.productImage.upsert({
      where: { id: "seed-img-serum" },
      update: {},
      create: {
        id:        "seed-img-serum",
        productId: product.id,
        url:       "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        alt:       "Sérum Éclat Ka — 30ml",
        isPrimary: true,
      },
    })

    console.log("✅ Produit de démo créé")
  }

  // Produits promo supplémentaires
  const corpsCategory = await prisma.category.findUnique({ where: { slug: "corps-bain" } })
  const makeupCategory = await prisma.category.findUnique({ where: { slug: "maquillage" } })
  const parfumsCategory = await prisma.category.findUnique({ where: { slug: "parfums" } })

  if (corpsCategory) {
    const p = await prisma.product.upsert({
      where: { slug: "huile-corps-sublime" },
      update: {},
      create: {
        name:        "Huile Corps Sublime",
        slug:        "huile-corps-sublime",
        description: "Huile sèche précieuse enrichie en argan et baobab. Peau satinée, lumineuse et parfumée.",
        ingredients: "Argania Spinosa Oil, Adansonia Digitata Oil, Jojoba Esters, Fragrance.",
        howToUse:    "Appliquer sur le corps après la douche. Masser jusqu'à absorption complète.",
        categoryId:  corpsCategory.id,
        isFeatured:  true,
        isActive:    true,
      },
    })
    await prisma.productVariant.upsert({
      where: { sku: "KA-HUILE-100ML" },
      update: {},
      create: { productId: p.id, name: "100 ml", sku: "KA-HUILE-100ML", price: 14500, comparePrice: 19000, stock: 40, isActive: true },
    })
    await prisma.productImage.upsert({
      where: { id: "seed-img-huile" },
      update: {},
      create: { id: "seed-img-huile", productId: p.id, url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800", alt: "Huile Corps Sublime", isPrimary: true },
    })
  }

  if (makeupCategory) {
    const p = await prisma.product.upsert({
      where: { slug: "fond-de-teint-lumiere" },
      update: {},
      create: {
        name:        "Fond de Teint Lumière",
        slug:        "fond-de-teint-lumiere",
        description: "Fond de teint longue tenue avec fini naturel et lumineux. Couvrance modulable, adapté aux peaux foncées.",
        ingredients: "Aqua, Glycerin, Titanium Dioxide, Iron Oxides, Niacinamide.",
        howToUse:    "Appliquer avec une éponge humide ou un pinceau en tapotant sur le visage.",
        categoryId:  makeupCategory.id,
        isFeatured:  false,
        isActive:    true,
      },
    })
    await prisma.productVariant.upsert({
      where: { sku: "KA-FDT-30ML" },
      update: {},
      create: { productId: p.id, name: "30 ml", sku: "KA-FDT-30ML", price: 12000, comparePrice: 16500, stock: 35, isActive: true },
    })
    await prisma.productImage.upsert({
      where: { id: "seed-img-fdt" },
      update: {},
      create: { id: "seed-img-fdt", productId: p.id, url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800", alt: "Fond de Teint Lumière", isPrimary: true },
    })
  }

  if (parfumsCategory) {
    const p = await prisma.product.upsert({
      where: { slug: "parfum-fleur-or" },
      update: {},
      create: {
        name:        "Parfum Fleur d'Or",
        slug:        "parfum-fleur-or",
        description: "Eau de parfum aux notes florales de jasmin, néroli et musc blanc. Une signature olfactive unique et envoûtante.",
        ingredients: "Alcohol Denat., Aqua, Parfum, Jasminum Grandiflorum, Citrus Aurantium.",
        howToUse:    "Vaporiser sur les poignets et la nuque. Ne pas frotter.",
        categoryId:  parfumsCategory.id,
        isFeatured:  false,
        isActive:    true,
      },
    })
    await prisma.productVariant.upsert({
      where: { sku: "KA-PARFUM-50ML" },
      update: {},
      create: { productId: p.id, name: "50 ml", sku: "KA-PARFUM-50ML", price: 24000, comparePrice: 32000, stock: 25, isActive: true },
    })
    await prisma.productImage.upsert({
      where: { id: "seed-img-parfum" },
      update: {},
      create: { id: "seed-img-parfum", productId: p.id, url: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800", alt: "Parfum Fleur d'Or", isPrimary: true },
    })
  }

  console.log("✅ 3 produits promo ajoutés")

  console.log("🎉 Seed terminé !")
}

main().catch(console.error)
