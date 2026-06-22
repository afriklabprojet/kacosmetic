# TECH.md — Ka Cosmetic E-Commerce

**Version:** 1.0
**Date:** 2026-06-20
**Statut:** Validé — Eng Review CLEAR

---

## Stack

| Couche          | Technologie              | Version  | Raison                                                 |
| --------------- | ------------------------ | -------- | ------------------------------------------------------ |
| Framework       | Next.js App Router       | 15.x     | SSR/ISR natif, Server Actions, API routes server-side  |
| Langage         | TypeScript               | 5.x      | Types stricts, sécurité à la compilation               |
| Styles          | Tailwind CSS             | 3.x      | Design tokens, utility-first, purge CSS automatique    |
| Base de données | PostgreSQL               | 16       | Relationnel, transactions ACID (stock, commandes)      |
| ORM             | Prisma                   | 5.x      | Types TypeScript générés, migrations versionnées       |
| DB hébergement  | Neon (serverless)        | —        | Compatible Vercel, scale-to-zero, connection pooling   |
| Auth            | NextAuth v5 (Auth.js)    | 5.x      | Google OAuth + email, CSRF/PKCE auto, Prisma adapter   |
| Paiement        | Jeko Africa              | REST API | Mobile Money CI (Orange, MTN, Wave, Moov) + cartes     |
| Images CDN      | Cloudinary               | free tier| WebP auto, LQIP blur hash, transformations URL         |
| SMS             | Twilio                   | —        | Notifications tracking livraison                       |
| Email           | Resend                   | —        | Email confirmation commande, alertes stock             |
| Cache           | Next.js ISR              | —        | revalidate=60s pages catalogue/produit                 |
| Déploiement     | Vercel                   | —        | Edge Network, CI/CD GitHub intégré                     |

---

## Structure du projet

```text
kacosmetic/
├── app/                          # Next.js App Router
│   ├── (shop)/                   # Route group — storefront public
│   │   ├── page.tsx              # Homepage
│   │   ├── catalogue/
│   │   │   └── [category]/
│   │   │       └── page.tsx      # ISR revalidate=60
│   │   ├── produit/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # ISR revalidate=60
│   │   ├── panier/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── [step]/
│   │   │       └── page.tsx      # step: informations | livraison | paiement
│   │   ├── confirmation/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx
│   │   └── compte/
│   │       ├── commandes/page.tsx
│   │       ├── adresses/page.tsx
│   │       └── wishlist/page.tsx
│   ├── admin/                    # Back-office protégé role=ADMIN
│   │   ├── layout.tsx            # Middleware auth admin
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── delivery/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── webhooks/
│       │   └── jeko-africa/route.ts        # Webhook paiement — vérif HMAC
│       ├── payment/
│       │   └── status/[orderId]/route.ts   # Polling statut paiement
│       ├── cart/route.ts
│       └── revalidate/route.ts             # On-demand ISR revalidation
│
├── components/
│   ├── Navigation/
│   │   ├── BottomTabBar.tsx      # Mobile <768px
│   │   └── Header.tsx            # Desktop
│   ├── Product/
│   │   ├── PhotoGallery.tsx      # Sticky desktop / carousel mobile
│   │   ├── ProductImage.tsx      # lazy + blur placeholder + WebP
│   │   └── ProductCard.tsx
│   ├── Cart/
│   │   ├── CartDrawer.tsx        # Drawer latéral droit
│   │   └── CartItem.tsx
│   ├── Checkout/
│   │   └── Stepper.tsx
│   └── Footer/
│       └── Footer.tsx            # 4 col desktop / accordéon mobile
│
├── lib/
│   ├── services/
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts        # Jeko Africa client + webhook verif
│   │   ├── product.service.ts
│   │   ├── delivery.service.ts
│   │   ├── notification.service.ts   # Resend (email) + Twilio (SMS)
│   │   └── image.service.ts          # Cloudinary upload + LQIP
│   ├── order-state-machine.ts        # Transitions état commande
│   ├── cart-merge.ts                 # Fusion panier guest → auth
│   ├── copy.ts                       # Copies UI chaleureux-luxe (§7.1)
│   └── auth.ts                       # NextAuth config
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── styles/
│   └── tokens.css                # CSS custom properties design system
│
├── public/
│   └── fonts/                    # Cormorant Garamond + DM Sans (self-hosted)
│
├── tailwind.config.js
├── next.config.js
├── .env.local                    # Variables locales (jamais commitées)
├── .env.example                  # Template variables requises
├── PRD.md
├── UI_UX_doc.md
└── TECH.md                       # Ce fichier
```

---

## Variables d'environnement requises

```bash
# .env.example — copier en .env.local, ne jamais commiter .env.local

# Base de données
DATABASE_URL=postgresql://...@neon.tech/kacosmetic

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Paiement Jeko Africa
JEKO_API_KEY=...
JEKO_SITE_ID=...
JEKO_WEBHOOK_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Resend (email)
RESEND_API_KEY=...
EMAIL_FROM=commandes@kacosmetic.ci

# ISR on-demand revalidation
REVALIDATE_SECRET=...
```

---

## Règles de sécurité

- `JEKO_API_KEY`, `JEKO_WEBHOOK_SECRET` — variables server-only (pas de préfixe `NEXT_PUBLIC_`)
- Webhook `/api/webhooks/jeko-africa` — vérification signature HMAC avant toute action
- Routes `/admin/*` — middleware NextAuth vérifie `session.user.role === 'ADMIN'`
- Panier guest en localStorage — contient uniquement des IDs et quantités, jamais de données sensibles
- Snapshots commande — prix et noms figés dans `OrderItem` (JSON), jamais relus depuis `Product`
- **Validation Zod** sur tous les Server Actions et API routes (jamais faire confiance au body entrant)
- **Rate limiting** : 60 req/min sur les routes API standard, 10 req/min sur `/api/webhooks/*`

### Headers HTTP de sécurité (`next.config.js`)

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",   // requis Next.js — à durcir en prod
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' res.cloudinary.com data: blob:",
      "font-src 'self'",
      "connect-src 'self' api.jeko.africa",
    ].join('; '),
  },
]
```

---

## Règles de performance

- Pages `/catalogue/*` et `/produit/*` : `export const revalidate = 60`
- Mise à jour stock/prix admin déclenche `fetch('/api/revalidate', ...)` → invalidation ciblée
- Images produits : `next/image` avec `placeholder="blur"` + `blurDataURL` généré par Cloudinary (LQIP)
- Images hero : `priority={true}` + `<link rel="preload">` dans `<head>`
- Polices : self-hosted dans `/public/fonts/` + `font-display: swap` + subset `latin`/`latin-ext`
- **Bundle JS initial < 150KB gzippé** — code splitting par route, pas d'import global de librairies lourdes
- **Dimensions fixes** sur tous les `<img>` — zéro CLS (Cumulative Layout Shift)
- **`next/font`** pour le chargement des polices avec preload automatique

---

## SEO

### Structured data JSON-LD (page produit)

```ts
// À inclure dans app/(shop)/produit/[slug]/page.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images.map((img) => img.url),
  description: product.description,
  brand: { '@type': 'Brand', name: 'Ka Cosmetic' },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'XOF',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `https://kacosmetic.ci/produit/${product.slug}`,
  },
}
```

### Fichiers SEO requis

| Fichier | Emplacement | Contenu |
| ------- | ----------- | ------- |
| `sitemap.xml` | `app/sitemap.ts` | Toutes les pages catalogue + produits (généré dynamiquement) |
| `robots.txt` | `app/robots.ts` | Bloquer `/admin`, `/api`, `/checkout`, `/confirmation` |
| `manifest.json` | `app/manifest.ts` | PWA metadata (nom, icônes, couleur thème #1A0A00) |

### Meta par page

| Page | Title | Description |
| ---- | ----- | ----------- |
| Homepage | `Ka Cosmetic — La fée de la perfection` | `Boutique de cosmétiques luxe à Abidjan. Livraison même jour.` |
| Catalogue | `Soins Visage — Ka Cosmetic` | `Découvrez notre sélection de soins visage premium.` |
| Produit | `[Nom produit] — Ka Cosmetic` | `[Première phrase description produit]` |
| Panier/Checkout | `noindex` | Pages transactionnelles — exclure de l'indexation |

---

## Réservation de stock (anti-oversell)

1. `PENDING` : stock réservé via champ `reservedStock` sur `ProductVariant` — TTL **10 minutes**
2. Vercel Cron `*/5 * * * *` → libère les réservations expirées + passe la commande en `CANCELLED`
3. `CONFIRMED` (webhook Jeko reçu) : déduit `stock` définitivement, reset `reservedStock`
4. Vérification à l'ajout panier et au checkout : `stock - reservedStock > 0`

---

## Commandes de développement

```bash
# Installation
npm install

# Dev local
npm run dev

# DB — créer/migrer
npx prisma migrate dev --name init
npx prisma generate

# DB — seed données de test
npx prisma db seed

# Build production
npm run build

# Vérification types
npx tsc --noEmit

# Lint
npm run lint
```

---

## Phases

| Phase   | Contenu                                                              | Statut   |
| ------- | -------------------------------------------------------------------- | -------- |
| MVP     | T1–T15 — Site complet, catalogue, checkout, compte, admin            | En cours |
| Phase 2 | Programme fidélité, Click & Collect, Prisma Accelerate, hors Abidjan | —        |
| Phase 3 | App mobile native                                                    | —        |
