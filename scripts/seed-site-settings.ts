import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
neonConfig.fetchConnectionCache = true

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SETTINGS: { key: string; value: string }[] = [
  {
    key: "announcements",
    value: JSON.stringify([
      { text: "Première commande — code BIENVENUE10 pour –10% de réduction", highlight: "BIENVENUE10" },
      { text: "Nouveau : Rituel Éclat Originel disponible en ligne", highlight: "Rituel Éclat Originel" },
      { text: "Paiement via Wave, Orange Money & Mobile Money accepté", highlight: "" },
    ]),
  },
  {
    key: "marquee_items",
    value: JSON.stringify([
      "La Fée de la Perfection",
      "Skincare Visage",
      "Rituels Corps & Bain",
      "Coffrets Exclusifs",
    ]),
  },
  {
    key: "social_links",
    value: JSON.stringify([
      { label: "Instagram", href: "https://instagram.com/kacosmetic.ci" },
      { label: "TikTok",    href: "https://tiktok.com/@kacosmetic.ci" },
      { label: "WhatsApp",  href: "https://wa.me/2250000000000" },
    ]),
  },
  {
    key: "hero_tagline",
    value: "La Fée de la Perfection",
  },
  {
    key: "hero_heading",
    value: "Sublime,|Par Nature.",
  },
  {
    key: "hero_description",
    value: "L'art de révéler votre lumière intérieure. Des rituels de beauté pensés pour l'excellence et la diversité des peaux noires et métissées.",
  },
  {
    key: "rituel_title",
    value: "Le Rituel de la|Fée",
  },
  {
    key: "rituel_description",
    value: "Fondée sur les secrets ancestraux de beauté africaine et sublimée par la science botanique moderne. Ka Cosmetic ne se contente pas de corriger — nous révélons l'éclat originel de chaque carnation avec une précision d'orfèvre.",
  },
  {
    key: "newsletter_description",
    value: "Rituels inédits, offres privées et avant-premières réservées aux membres.",
  },
  {
    key: "engagements",
    value: JSON.stringify([
      {
        title: "Formules Clean",
        description: "Cruelty-free, sans parabènes ni sulfates. Certifiées adaptées aux peaux noires et métissées.",
      },
      {
        title: "Livraison J0 & J+1",
        description: "Emballage éco-luxe, livraison J0 & J+1 dans tout Abidjan.",
      },
      {
        title: "Paiement 100% Sécurisé",
        description: "Wave, Orange Money, MTN, Djamo, Visa & Mastercard — cryptage bancaire de bout en bout.",
      },
    ]),
  },
  {
    key: "testimonials",
    value: JSON.stringify([
      {
        id: 1,
        name: "Aminata K.",
        location: "Cocody, Abidjan",
        rating: 5,
        text: "La crème éclat a totalement transformé mon teint en 2 semaines. Mon visage est lumineux comme jamais. Je recommande à toutes mes amies !",
        product: "Crème Éclat Botanique",
        date: "Juin 2026",
        initials: "AK",
      },
      {
        id: 2,
        name: "Fatou D.",
        location: "Plateau, Abidjan",
        rating: 5,
        text: "J'utilise Ka Cosmetic depuis 6 mois. La livraison est toujours rapide, les produits sont authentiques et l'emballage est luxueux. Je suis une cliente fidèle.",
        product: "Sérum Vitamine C",
        date: "Mai 2026",
        initials: "FD",
      },
      {
        id: 3,
        name: "Mariame T.",
        location: "Yopougon, Abidjan",
        rating: 5,
        text: "Enfin des produits pensés pour nos peaux noires ! Résultats visibles dès la première semaine. Le service client est exceptionnel.",
        product: "Huile Corps Karité",
        date: "Juin 2026",
        initials: "MT",
      },
      {
        id: 4,
        name: "Kadiatou B.",
        location: "Marcory, Abidjan",
        rating: 5,
        text: "Le coffret cadeau que j'ai offert à ma mère était magnifiquement emballé. Elle a adoré chaque produit. Ka Cosmetic c'est du luxe accessible !",
        product: "Coffret Prestige",
        date: "Mai 2026",
        initials: "KB",
      },
    ]),
  },
  {
    key: "brand_tagline",
    value: "La Fée de la Perfection",
  },
]

async function main() {
  for (const { key, value } of SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},  // do not overwrite if already customised
      create: { key, value },
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    process.stderr.write(String(e) + "\n")
    await prisma.$disconnect()
    process.exit(1)
  })
