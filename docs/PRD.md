# PRD — Ka Cosmetic E-Commerce

**Version:** 1.1
**Date:** 2026-06-20
**Auteur:** Plan généré via /plan-design-review + /plan-eng-review
**Statut:** Validé — Design Review CLEAR + Eng Review CLEAR

---

## 1. Vision & Contexte

Ka Cosmetic est une boutique de cosmétiques positionnée **luxe / prestige** à Abidjan, Côte d'Ivoire. Le site e-commerce est le flagship digital de la marque — premier point de contact pour une clientèle aisée ivoirienne et diaspora africaine.

**Objectif principal :** Vendre des produits cosmétiques en ligne avec une expérience d'achat qui reflète le standing de la marque — luxueuse, africaine, moderne. Le produit final doit être visuellement comparable à Sephora, Fenty Beauty et The Ordinary.

**Marché cible :**

- Femmes 25–45 ans, CSP+ Abidjan (Cocody, Plateau, Marcory Résidentiel)
- Diaspora africaine (France, Canada) qui commande pour la famille en Côte d'Ivoire
- Budget moyen panier : 25 000–150 000 FCFA

---

## 2. Problème utilisateur

Une cliente Ka Cosmetic ne peut actuellement pas :

1. Découvrir le catalogue complet sans se déplacer en boutique
2. Passer commande en dehors des horaires boutique
3. Payer via Mobile Money (Orange Money, MTN, Wave, Djamo) ou carte
4. Se faire livrer dans son quartier Abidjan sans appeler

---

## 3. Périmètre MVP (Lancement)

### 3.1 Catalogue produits

- Pages catégories : Soins visage, Corps, Cheveux, Maquillage, Parfums
- Produits vedettes + promotions + nouveautés sur la homepage
- Page produit : 4–6 photos haute résolution, description richtext, variantes (teinte/taille/contenance), stock temps réel
- Recherche + filtres (catégorie, prix, marque, nouveauté)

### 3.2 Panier & Checkout

- Panier persistant (guest localStorage + compte DB)
- Vérification stock en temps réel à la validation panier
- Application codes promo (ex : `BIENVENUE10` — 10%, usage unique par client)
- Calcul automatique frais livraison selon zone sélectionnée
- Checkout 3 étapes : Informations → Livraison → Paiement
- **Modes de paiement (Jeko Africa) :** Wave, Orange Money CI, MTN Money CI, Moov Money, Djamo, Visa, Mastercard
- Génération facture PDF à la confirmation (numéro unique `KA-2026-XXXX`)
- Récapitulatif commande par **email + SMS + WhatsApp**
- Page confirmation commande avec résumé complet

### 3.3 Compte client

- Inscription / connexion (email + Google OAuth)
- Confirmation d'inscription par email
- Tableau de bord : historique commandes, statuts, re-commander
- Liste de souhaits (wishlist)
- Adresses sauvegardées

### 3.4 Livraison Abidjan

- Zones : Cocody, Plateau, Marcory, Treichville, Yopougon, Abobo, Adjamé, Koumassi, Port-Bouët
- Tarification par zone (ex : Cocody = 1 500 FCFA, Yopougon = 2 500 FCFA)
- Délais : Même jour (commande avant 12h) ou J+1
- Suivi commande par SMS + WhatsApp (numéro de tracking)
- Génération bordereau expédition côté admin

### 3.5 Notifications automatiques

Chaque événement déclenche une notification multicanal :

| Événement | Email | SMS | WhatsApp |
| --------- | :---: | :-: | :------: |
| Confirmation inscription | ✅ | — | — |
| Confirmation commande | ✅ | ✅ | ✅ |
| Confirmation paiement | ✅ | ✅ | ✅ |
| Mise en préparation | ✅ | ✅ | — |
| Expédition | ✅ | ✅ | ✅ |
| Livraison | — | ✅ | ✅ |
| Relance panier abandonné (J+1) | ✅ | — | ✅ |
| Offres promotionnelles | ✅ | — | ✅ |

### 3.6 Flux alternatifs

**Paiement échoué :** Commande reste en `PENDING` → notification client → page retry paiement → nouvelle tentative sans recréer la commande.

**Rupture de stock (checkout) :** Vérification stock avant validation → si insuffisant, message inline sur le produit concerné + CTA "M'alerter quand disponible".

**Abandon de panier :** Panier inactif > 24h → relance email + WhatsApp automatique → offre promotionnelle éventuelle (configurable admin).

**Annulation commande :** Client demande annulation → vérification statut (annulable uniquement en `CONFIRMED` ou `PREPARING`) → stock relâché → remboursement selon politique Ka Cosmetic → notification confirmation annulation.

### 3.7 Règles métier

- Stock vérifié avant validation commande — commande bloquée si insuffisant
- Commande non préparable sans paiement `CONFIRMED`
- Code `BIENVENUE10` : 10% réduction, usage unique par client (vérifié en base)
- Prix affichés en **FCFA** uniquement
- Chaque commande a un identifiant unique `KA-YYYY-XXXX`
- Chaque changement de statut commande génère une notification multicanal
- Annulation possible uniquement en statut `CONFIRMED` ou `PREPARING`
- Remboursements selon politique commerciale Ka Cosmetic (traitement manuel admin)

---

## 4. Hors périmètre MVP

- Programme fidélité / points
- Click & Collect en boutique (Phase 2)
- Application mobile native (Phase 3)
- Livraison hors Abidjan (Phase 2 — villes CI + international)
- Marketplace multi-vendeurs
- Blog beauté / contenu éditorial

---

## 5. Métriques de succès

| Métrique | Objectif M3 |
| -------- | ----------- |
| Taux de conversion visiteur → achat | ≥ 2.5% |
| Valeur panier moyen | ≥ 35 000 FCFA |
| Taux abandon panier | ≤ 65% |
| Score NPS clients | ≥ 40 |
| Délai livraison respecté | ≥ 90% |

### KPIs — Dashboard admin

### Ventes

| KPI | Description | Objectif M3 |
| --- | ----------- | ----------- |
| Chiffre d'affaires | Total FCFA sur période | — |
| Nombre de commandes | Commandes confirmées | — |
| Panier moyen | CA / nb commandes | ≥ 35 000 FCFA |

### Marketing

| KPI | Description | Objectif M3 |
| --- | ----------- | ----------- |
| Taux de conversion | Visiteurs → achat | ≥ 2.5% |
| Taux d'abandon panier | Paniers non validés | ≤ 65% |
| Utilisation coupons | Nb utilisations / coupon | — |

### Logistique

| KPI | Description | Objectif M3 |
| --- | ----------- | ----------- |
| Temps moyen préparation | CONFIRMED → IN_DELIVERY | — |
| Temps moyen livraison | IN_DELIVERY → DELIVERED | ≥ 90% dans les délais |

### Satisfaction

| KPI | Description | Objectif M3 |
| --- | ----------- | ----------- |
| Note moyenne avis | /5 étoiles | — |
| Taux de réclamation | Réclamations / commandes | — |
| NPS | Net Promoter Score | ≥ 40 |

---

## 5.5 Stack technique (décidée — Eng Review)

| Couche | Choix | Raison |
| ------ | ----- | ------ |
| Framework | **Next.js 15 App Router** | SSR/ISR natif, Server Actions, API routes server-side |
| Styles | **Tailwind CSS** | Tokens design system, utility-first |
| Base de données | **PostgreSQL + Prisma ORM** (Neon serverless) | Types TypeScript générés, migrations versionnées |
| Auth | **NextAuth v5 (Auth.js)** + Prisma adapter | Google OAuth + email, CSRF/PKCE automatiques |
| Paiement | **Jeko Africa** | Wave, Orange Money, MTN, Moov, Djamo, Visa, Mastercard |
| Images CDN | **Cloudinary** (free tier 10GB) | WebP auto, LQIP blur hash, transformations URL |
| Cache | **ISR revalidate=60s** + on-demand revalidation | Lighthouse ≥ 90 mobile |
| Panier guest | **localStorage** + fusion DB au login | Zéro serveur pour guest |
| Email | **Resend** | Confirmations commande, relances panier |
| SMS | **Twilio** | Tracking livraison, confirmations |
| WhatsApp | **WhatsApp Business API** | Confirmations, suivi, relances |
| Admin | **Next.js /admin/*** protégé NextAuth role=ADMIN | Même codebase |
| Déploiement | **Vercel** | Edge Network, CI/CD GitHub intégré |

---

## 5.6 Architecture Backend

### Modèles de données

```text
Product ──── ProductVariant (taille/teinte/contenance)
    │
    └── Category, ProductImage[]

Customer ──── Address[], WishlistItem[], Order[]

Order ──────── OrderItem[] (snapshot prix/nom figé)
    │               └── ProductVariant
    ├── Payment (Jeko Africa reference + webhook payload)
    ├── DeliveryZone
    └── Invoice (PDF généré à CONFIRMED)

Coupon ──── CouponUsage[] (usage unique par client vérifié)

Cart (guest: localStorage / auth: DB) ──── CartItem[]
```

**State machine commande :**

```text
PENDING → CONFIRMED → PREPARING → IN_DELIVERY → DELIVERED
   │            │
   └── CANCELLED (paiement échoué, timeout, annulation client)
```

- Stock **réservé** à `PENDING` (TTL 10 minutes), **déduit** définitivement à `CONFIRMED`
- Expiration → `CANCELLED` + stock relâché (Vercel Cron `*/5 * * * *`)
- `OrderItem` contient un snapshot JSON prix+nom — immuable après commande
- `Invoice` PDF généré à `CONFIRMED` (numéro `KA-YYYY-XXXX`)

### Couche services (`lib/services/`)

| Service | Responsabilité |
| ------- | -------------- |
| `cart.service.ts` | add/remove/update, calcul total, merge guest→auth |
| `order.service.ts` | création depuis panier, transitions state machine, snapshot |
| `payment.service.ts` | initiation Jeko Africa, vérification webhook HMAC, retry |
| `product.service.ts` | CRUD, search+filtres, réservation/libération stock |
| `delivery.service.ts` | calcul frais par zone, validation zone desservie |
| `coupon.service.ts` | validation code, vérification usage unique, application remise |
| `invoice.service.ts` | génération PDF facture, stockage Cloudinary |
| `notification.service.ts` | email (Resend) + SMS (Twilio) + WhatsApp Business API |
| `image.service.ts` | upload Cloudinary, génération LQIP, resize WebP |

### Flux paiement Jeko Africa

```text
1. Server Action → payment.service.initiatePayment()
   ├── Réserve stock (TTL 10min)
   ├── POST Jeko Africa API → reçoit jekoReference
   └── Retourne { status: "waiting" }

2. Client → page /checkout/paiement/attente
   ├── Minuteur 3min visible
   └── Polling /api/payment/status/[orderId] toutes les 5s

3. POST /api/webhooks/jeko-africa (Jeko → notre serveur)
   ├── Vérification signature HMAC (header X-Jeko-Signature)
   ├── Paiement OK → CONFIRMED, stock définitif, facture générée, notifs envoyées
   └── Échec/timeout → CANCELLED, stock relâché
```

### Routes admin (`/admin/*`)

Protégé par middleware NextAuth `role === 'ADMIN'` :

- `/admin/products` — CRUD produits + variants + stock
- `/admin/orders` — liste commandes, mise à jour statut, génération bordereau
- `/admin/delivery` — gestion zones et tarifs livraison
- `/admin/coupons` — gestion codes promo (BIENVENUE10, campagnes)
- `/admin/analytics` — dashboard KPIs

### Workflow complet — Happy Path

```text
Étape 1  — Navigation        : Homepage → produits vedettes, promos, catégories, nouveautés
Étape 2  — Recherche         : Recherche texte + filtres → page produit (photos HD, variantes)
Étape 3  — Ajout panier      : Sélection variante + quantité → vérif stock → drawer panier
Étape 4  — Validation panier : Vérif stock + code promo + frais livraison
Étape 5  — Paiement          : Jeko Africa (Wave/Orange/MTN/Moov/Djamo/Visa/Mastercard)
Étape 6  — Confirmation      : Facture PDF générée + email + SMS + WhatsApp
Étape 7  — Préparation       : Admin → PREPARING + bordereau + notifs
Étape 8  — Expédition        : Admin → IN_DELIVERY + numéro suivi + notifs
Étape 9  — Livraison         : Admin → DELIVERED + SMS + WhatsApp client
Étape 10 — Fidélisation      : Demande avis (J+3) + recommandations + offres
```

---

## 6. Contraintes techniques — Niveau Production Premium

Le produit final doit être visuellement et techniquement comparable à **Sephora, Fenty Beauty, The Ordinary**. Ces contraintes sont non-négociables.

### 6.1 Performance

| Métrique | Cible | Référence |
| -------- | ----- | --------- |
| Lighthouse Performance (mobile) | ≥ 90 | Sephora mobile : ~88 |
| LCP (Largest Contentful Paint) | < 2.5s | Core Web Vitals "Good" |
| CLS (Cumulative Layout Shift) | < 0.1 | Dimensions fixes obligatoires sur `<img>` |
| INP (Interaction to Next Paint) | < 200ms | Pas de JS bloquant sur les interactions |
| TTFB (Time to First Byte) | < 800ms | ISR + Vercel Edge |
| Taille bundle JS initial | < 150KB gzippé | Code splitting par route obligatoire |

- **Mobile-first :** 70%+ du trafic sur mobile Android budget (3G/4G CI)
- Images produits : WebP, max 200KB, LQIP blur placeholder obligatoire
- Polices : self-hosted + `font-display: swap` + subset latin+latin-ext uniquement
- Aucun layout shift : dimensions `width`/`height` obligatoires sur tous les `<img>`

### 6.2 SEO — Niveau premium

- **Structured data JSON-LD** sur chaque page produit : `Product` + `BreadcrumbList`
- **Open Graph complet** : `og:title`, `og:description`, `og:image` (1200×630), `og:price:amount` — optimisé partage WhatsApp
- **`sitemap.xml` dynamique** (toutes les pages catalogue + produits)
- **`robots.txt`** : bloquer `/admin/*`, `/api/*`, `/checkout/*`
- **URLs canoniques** sur chaque page
- **Balises meta** : title unique par page, description 150-160 chars
- Pages catalogue/produit rendues en HTML pur (SSR/ISR) — pas de JS pour le contenu principal

### 6.3 Sécurité — Production

- Headers HTTP : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Content-Security-Policy`, `Permissions-Policy`
- Rate limiting : 60 req/min API standard, 10 req/min webhooks
- Validation Zod sur tous les Server Actions et API routes
- CORS : API routes acceptent uniquement le domaine production
- Aucune clé secrète avec préfixe `NEXT_PUBLIC_`
- Logs : tentatives webhook invalides, échecs auth, erreurs 5xx

### 6.4 Scalabilité

- Connection pooling : Prisma + PgBouncer (Neon intégré) — obligatoire dès le lancement
- Stateless : aucun état serveur en mémoire
- ISR : pages catalogue/produit pre-rendues
- Cloudinary CDN pour toutes les images
- Services découplés (`lib/services/`) — testables indépendamment

### 6.5 Langue & Accessibilité

- Français uniquement (MVP)
- WCAG AA : contraste 4.5:1 corps / 3:1 texte large, touch targets 44×44px, navigation clavier complète

---

## 7. Décisions de design

| # | Décision | Résolution |
| - | -------- | ---------- |
| D1 | Direction visuelle homepage | Noir profond #1A0A00 + or #C9A84C + ivoire #FAF6F1 |
| D2 | Navigation mobile | Bottom tab bar — Accueil / Catalogue / Recherche / Compte / Panier |
| D3 | Page produit photos | Grid sticky desktop / carousel swipe mobile |
| D4 | Checkout flow | Stepper mono-page — URL /checkout/[step], progress bar Étape N/3 |
| D5 | Typographie | Cormorant Garamond (display) + DM Sans (corps) |
| D6 | Ton des textes UI | Chaleureux-luxe — voir UI_UX_doc §7.1 |

---

## 8. Références & Inspirations

- Positionnement : Sephora.fr (luxe), Fenty Beauty (inclusivité premium), The Ordinary (clarté produit)
- UX Checkout : Jumia.ci (familiarité locale), mais plus premium
- Design : élégance sobre, palette chaude, photography haut de gamme

---

## 9. Tâches d'implémentation

### 9.1 Frontend / Design (Design Review)

- [ ] **T1 (P1, human: ~1j / CC: ~30min)** — Design system — Tokens CSS + tailwind.config.js
  - Files : `styles/tokens.css`, `tailwind.config.js`
  - Verify : Toutes les couleurs et polices UI_UX_doc §1 présentes

- [ ] **T2 (P1, human: ~3h / CC: ~20min)** — Navigation — Bottom tab bar mobile + header desktop
  - Files : `components/Navigation/BottomTabBar.tsx`, `components/Navigation/Header.tsx`
  - Verify : Visible sur 375px, invisible sur > 768px

- [ ] **T3 (P1, human: ~4h / CC: ~30min)** — Page produit — Grid sticky desktop / carousel mobile
  - Files : `components/Product/PhotoGallery.tsx`
  - Verify : Sticky scroll desktop, swipe mobile

- [ ] **T4 (P1, human: ~4h / CC: ~45min)** — Checkout — Stepper mono-page /checkout/[step]
  - Files : `app/checkout/[step]/page.tsx`, `components/Checkout/Stepper.tsx`
  - Verify : Progress bar "Étape N/3", 0 rechargement entre steps

- [ ] **T5 (P1, human: ~2h / CC: ~15min)** — Checkout — Page attente paiement Mobile Money
  - Files : `app/checkout/paiement/attente/page.tsx`
  - Verify : Minuteur 3 min visible, pas de redirect automatique

- [ ] **T6 (P2, human: ~2h / CC: ~15min)** — Footer — 4 colonnes desktop / accordéon mobile
  - Files : `components/Footer/Footer.tsx`
  - Verify : Logos paiement (Wave, Orange Money, MTN, Djamo, Visa) présents

- [ ] **T7 (P2, human: ~1h / CC: ~10min)** — Images — lazy loading + blur placeholder + WebP
  - Files : `components/Product/ProductImage.tsx`
  - Verify : Lighthouse Performance ≥ 90 mobile simulé

- [ ] **T8 (P2, human: ~1h / CC: ~10min)** — Copy UI — Ton chaleureux-luxe sur tous les textes
  - Files : `lib/copy.ts`
  - Verify : Aucun texte générique "Voir nos produits", "Panier vide", "Bienvenue"

- [ ] **T9 (P3, human: ~3h / CC: ~20min)** — DESIGN.md — Charte design officielle Ka Cosmetic
  - Files : `DESIGN.md`
  - Verify : Palette, typographie, grid, composants documentés

### 9.2 Backend opérationnel (Eng Review)

- [ ] **T10 (P1, human: ~30min / CC: ~5min)** — Stack — TECH.md ✅ (complété)
  - Files : `TECH.md`

- [ ] **T11 (P1, human: ~4h / CC: ~30min)** — Database — Schéma Prisma complet
  - Files : `prisma/schema.prisma`
  - Verify : Modèles Product, Variant, Order, OrderItem, Customer, Address, Cart, DeliveryZone, Coupon, Invoice + migrations OK

- [ ] **T12 (P1, human: ~3h / CC: ~20min)** — Payment — Webhook Jeko Africa + state machine commande
  - Files : `app/api/webhooks/jeko-africa/route.ts`, `lib/order-state-machine.ts`
  - Verify : Signature HMAC vérifiée, payload falsifié rejeté

- [ ] **T13 (P1, human: ~3h / CC: ~15min)** — Cart — Fusion panier guest→compte au login
  - Files : `lib/cart-merge.ts`, `app/api/cart/route.ts`
  - Verify : Panier fusionné sans doublon ni perte

- [ ] **T14 (P1, human: ~2h / CC: ~15min)** — Notifications — Service multicanal Email + SMS + WhatsApp
  - Files : `lib/services/notification.service.ts`
  - Verify : Tous les événements du tableau §3.5 déclenchent la bonne combinaison de canaux

- [ ] **T15 (P1, human: ~2h / CC: ~15min)** — Coupons — Validation BIENVENUE10 + usage unique
  - Files : `lib/services/coupon.service.ts`, `prisma/schema.prisma`
  - Verify : Deuxième utilisation du même code par le même client bloquée

- [ ] **T16 (P2, human: ~3j / CC: ~2h)** — Admin — Interface CRUD produits + commandes + analytics KPIs
  - Files : `app/admin/products/`, `app/admin/orders/`, `app/admin/analytics/`, `app/admin/coupons/`
  - Verify : CRUD produits, mise à jour statuts commandes, dashboard KPIs §5

- [ ] **T17 (P2, human: ~2h / CC: ~10min)** — Performance — ISR + on-demand revalidation
  - Files : `app/catalogue/[category]/page.tsx`, `app/produit/[slug]/page.tsx`, `app/api/revalidate/route.ts`
  - Verify : revalidate=60, Lighthouse ≥ 90 mobile simulé

- [ ] **T18 (P2, human: ~2h / CC: ~15min)** — Facture PDF — Génération à la confirmation commande
  - Files : `lib/services/invoice.service.ts`
  - Verify : PDF généré avec numéro KA-YYYY-XXXX, stocké Cloudinary, lien dans email

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| ------ | ------- | --- | ---- | ------ | -------- |
| CEO Review | `/plan-ceo-review` | Scope & stratégie | 0 | — | — |
| Codex Review | `/codex review` | Second avis indépendant | 1 | **issues_found** | 6 gaps identifiés (Claude subagent) |
| Eng Review | `/plan-eng-review` | Architecture & tests (requis) | 1 | **CLEAR** | 7 issues, tous résolus — stack déclarée, tâches backend ajoutées |
| Design Review | `/plan-design-review` | Gaps UI/UX | 1 | **CLEAR** | score: 4/10 → 8/10, 7 décisions résolues |
| DX Review | `/plan-devex-review` | Expérience développeur | 0 | — | — |

- **CROSS-MODEL:** Outside Voice a identifié 3 gaps — backend ops absent (ajoutés), latence West Africa (acceptée MVP), Neon cold starts (Prisma Accelerate Phase 2).
- **VERDICT:** Design Review + Eng Review CLEAR — prêt pour implémentation.

NO UNRESOLVED DECISIONS
