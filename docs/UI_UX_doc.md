# UI/UX Design Document — Ka Cosmetic
**Version:** 1.0 — Draft  
**Date:** 2026-06-20  
**Statut:** En révision design

---

## 1. Design System

### 1.0 Identité de marque — Logo validé

**Logo :** `logo.png` — KA COSMETIC avec mascotte fée dorée sur fond cercle blanc  
**Tagline :** "La fée de la perfection" — affichée uniquement dans le footer  
**Mascotte :** Fée dorée — réservée au logo, pas dupliquée sur le site

**Règles logo :**
- Le logo est toujours affiché en `<img>` (PNG/SVG) — jamais recréé en CSS/texte
- Fond logo : cercle blanc → sur fond `#1A0A00` (header), utiliser version logo fond transparent
- Taille header desktop : hauteur 40px. Mobile : hauteur 32px
- Espace autour du logo : minimum `lg` (24px) de chaque côté

**Alignement palette/logo :**
- Or logo `≈ #C9A84C` — aligné ✅
- Fond cercle `≈ #FAF6F1` ivoire — aligné ✅
- Texte "KA COSMETIC" noir `≈ #1A0A00` — aligné ✅
- Police logo (bold condensed sans-serif) ≠ Cormorant Garamond — **normal, pas un conflit**. Le logo est une image, Cormorant Garamond s'applique aux titres du site.

---

### 1.1 Palette de couleurs

```
Couleur principale  : #1A0A00  (brun nuit — luxe, profondeur africaine)
Accent or           : #C9A84C  (or chaud — prestige, qualité)
Fond                : #FAF6F1  (crème ivoire — douceur, féminité)
Fond secondaire     : #F0E8DC  (beige chaud)
Texte principal     : #1A0A00
Texte secondaire    : #6B5744
Erreur              : #C0392B
Succès              : #27AE60
Bordures            : #E5D5C5
```

### 1.2 Typographie

```
Display/Titre      : Cormorant Garamond (serif élégant) — titres H1, H2
Corps              : DM Sans (humaniste sans-serif lisible) — body, UI
Accent/Prix        : DM Mono — prix, codes promo, numéros
```

**Chargement polices (production) :**

- Self-hosted dans `/public/fonts/` — zéro dépendance Google Fonts en prod
- Formats : `woff2` uniquement (tous navigateurs modernes)
- Subset : `latin` + `latin-ext` uniquement (pas de CJK — économie 60% taille)
- `font-display: swap` obligatoire sur toutes les fonts
- Preload des deux fonts critiques dans `<head>` : Cormorant Garamond 400/600, DM Sans 400/500

**INTERDIT :** Inter, Roboto, Arial, system-ui comme police principale (signal "j'ai abandonné la typographie").

### 1.3 Espacement (8-point grid)

```
xs   : 4px
sm   : 8px
md   : 16px
lg   : 24px
xl   : 32px
2xl  : 48px
3xl  : 64px
4xl  : 96px
```

### 1.4 Border radius

```
Boutons     : 2px (anguleux = luxe, pas de bubbly SaaS)
Cards       : 4px (discret)
Images      : 0px (plein bord = mode, haute couture)
Inputs      : 0px bottom / 1px top (underline style = premium)
```

### 1.5 Ombres

```
Card hover  : 0 8px 32px rgba(26,10,0,0.12)
Modal       : 0 24px 64px rgba(26,10,0,0.20)
Sticky nav  : 0 2px 8px rgba(26,10,0,0.08)
```

---

## 2. Structure de l'information

### 2.1 Navigation principale

```
[Logo Ka Cosmetic]    [Soins Visage] [Corps] [Cheveux] [Maquillage] [Parfums]    [Recherche] [Compte] [Panier (N)]
```

**Mobile (< 768px) — Bottom Tab Bar** *(D2 décidée)*
```
[Accueil] [Catalogue] [Recherche] [Compte] [Panier(N)]
↑ barre fixe en bas, 56px, fond #1A0A00, icônes blanches, label sous icône
```

### 2.2 Arborescence pages

```
/ (Homepage)
├── /catalogue                        (liste tous produits)
│   ├── /catalogue/soins-visage
│   ├── /catalogue/corps
│   ├── /catalogue/cheveux
│   ├── /catalogue/maquillage
│   └── /catalogue/parfums
├── /produit/[slug]                   (page produit)
├── /panier                           (panier)
├── /checkout                         (checkout)
│   ├── /checkout/informations
│   ├── /checkout/livraison
│   └── /checkout/paiement
├── /confirmation/[orderId]           (confirmation commande)
├── /compte                           (espace client)
│   ├── /compte/commandes
│   ├── /compte/adresses
│   └── /compte/wishlist
├── /connexion
└── /inscription
```

### 2.3 Hiérarchie visuelle Homepage

```
PRIORITÉ 1 — Hero (brand identity + CTA principal)
  ↳ Image produit phare grand format
  ↳ Signature de marque (1 ligne)
  ↳ 1 CTA : "Découvrir la collection"

PRIORITÉ 2 — Catégories featured (5 tuiles visuelles)
  ↳ Chaque catégorie = 1 image + nom catégorie

PRIORITÉ 3 — Nouveautés / Sélection du moment
  ↳ 4–6 produits en scroll horizontal mobile / grid desktop

PRIORITÉ 4 — Bande de réassurance (livraison, paiement sécurisé, retours)
  ↳ 3 éléments texte + icône simple, fond discret

PRIORITÉ 5 — Newsletter (optionnel MVP)
  ↳ 1 champ email, 1 CTA, promesse de valeur
```

---

## 3. États d'interaction

### 3.1 Page Catalogue

| État | Ce que l'utilisateur voit |
|------|--------------------------|
| Chargement | Skeleton cards — rectangles gris animés, même ratio que vraies cards |
| Résultats | Grid produits 2 col mobile / 3 col tablet / 4 col desktop |
| Vide (filtre sans résultat) | Illustration chaleureuse + "Aucun produit ne correspond" + bouton "Réinitialiser les filtres" |
| Vide (catégorie vide) | "Cette collection arrive bientôt" + image teaser + bouton notifier |
| Erreur réseau | "Impossible de charger les produits" + bouton "Réessayer" |
| Fin de liste | Chargement infini ou pagination numérotée claire |

### 3.2 Page Produit

| État | Ce que l'utilisateur voit |
|------|--------------------------|
| Chargement | Skeleton : grande zone image gauche, skeleton texte droite |
| En stock | Bouton "Ajouter au panier" — fond #1A0A00, texte blanc |
| Stock faible (< 5) | Badge "Plus que X en stock" (orange discret) + bouton actif |
| Rupture de stock | Bouton "M'alerter quand disponible" + input email |
| Variante non sélectionnée | Bouton "Choisir une option" désactivé (grisé) |
| Ajout au panier réussi | Drawer latéral droit glisse — affiche le panier avec le produit ajouté |
| Erreur ajout | Toast rouge en bas : "Impossible d'ajouter. Réessayez." |

### 3.3 Panier

| État | Ce que l'utilisateur voit |
|------|--------------------------|
| Panier vide | Illustration sac vide + "Votre panier est vide" + "Découvrir la collection" |
| Produits | Liste produits (image, nom, variante, quantité éditable, prix, supprimer) |
| Coupon invalide | Inline error rouge sous le champ coupon |
| Coupon valide | Badge vert "–X% appliqué" + ligne réduction dans total |
| Livraison non calculée | "Frais calculés à l'étape suivante" (texte discret) |

### 3.4 Checkout

| État | Ce que l'utilisateur voit |
|------|--------------------------|
| Attente confirmation Mobile Money | Page dédiée "Vérifiez votre téléphone — Une notification a été envoyée à votre numéro Orange/MTN/Wave. Approuvez le paiement dans les 3 minutes." + minuteur visible + instructions screenshot. NE PAS rediriger avant confirmation. |
| Chargement paiement | Overlay "Traitement en cours..." + spinner (NE PAS permettre double-clic) |
| Paiement réussi | Redirect → /confirmation/[id] |
| Paiement refusé | Message d'erreur spécifique (carte refusée / fonds insuffisants / timeout) + retry |
| Session expirée | Modal "Votre session a expiré" + redirect login |
| Zone non desservie | Message inline sous le sélecteur de quartier |

### 3.5 Compte client

| État | Ce que l'utilisateur voit |
|------|--------------------------|
| Aucune commande | "Vous n'avez pas encore commandé" + CTA boutique |
| Wishlist vide | "Sauvegardez vos favoris" + illustration + CTA catalogue |
| Commande en cours | Statut visuel (timeline : Confirmée → Préparée → En livraison → Livrée) |

---

## 4. Parcours utilisateur (User Journey)

### 4.1 Achat produit (golden path)

```
ÉTAPE | CE QU'ELLE FAIT          | CE QU'ELLE RESSENT        | CE QUE LE SITE FAIT
------|---------------------------|---------------------------|--------------------
1     | Arrive homepage           | Curiosité / découverte    | Hero impactant, image luxueuse
2     | Clique une catégorie      | Exploration               | Grid produits rapide, filtres discrets
3     | Ouvre page produit        | Désir                     | Photos HD, description qualitative
4     | Choisit variante          | Décision                  | Feedback visuel clair sur sélection
5     | Ajoute au panier          | Satisfaction              | Drawer panier confirme sans quitter la page
6     | Va au checkout            | Engagement                | Étapes claires, progress visible
7     | Paye (Orange Money)       | Confiance / anxiété       | UX paiement rassurante, pas de redirect surprise
8     | Confirmation              | Soulagement / joie        | Page confirmation enthousiaste + email
9     | Reçoit livraison          | Satisfaction finale       | SMS de suivi pro
```

### 4.2 Arcs émotionnels à risque

| Moment critique | Risque | Mitigation |
|-----------------|--------|------------|
| Chargement lent (mobile 3G) | Abandon | Skeleton screens, lazy loading images |
| Doute sur paiement Mobile Money | Abandon checkout | Logos Orange/MTN/Wave bien visibles, texte rassurant |
| Variante épuisée | Frustration | CTA "M'alerter" proactif |
| Formulaire checkout long | Abandon | Autofill, adresses sauvegardées, champs minimum |

---

## 5. Responsive Design

**Approche : Mobile-first obligatoire.** Tout le CSS est écrit pour mobile d'abord (`base`), puis surchargé pour tablet (`md:`) et desktop (`lg:`). Jamais l'inverse.

### 5.1 Breakpoints (Tailwind)

```
base     : 0px+      → mobile (<640px) — 70% du trafic, priorité absolue
sm:      : 640px+    → petits mobiles paysage / grandes mains (peu utilisé)
md:      : 768px+    → tablet (iPad portrait, Android 10")
lg:      : 1024px+   → desktop (laptop, écran bureau)
xl:      : 1280px+   → large desktop (max-width container = 1280px)
```

Règle container :

```css
/* Toujours centré, padding horizontal adaptatif */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;        /* mobile */
}
/* md: padding: 0 24px; */
/* lg: padding: 0 32px; */
```

---

### 5.2 Adaptations par composant

| Composant | Mobile (base) | Tablet (md:) | Desktop (lg:) |
| --------- | ------------- | ------------ | ------------- |
| **Navigation** | Bottom tab bar fixe 56px — Accueil / Catalogue / Recherche / Compte / Panier | Bottom tab bar (inchangé) | Header horizontal : logo + nav catégories + icônes droite |
| **Hero** | Plein écran, image en background, texte + CTA en overlay bas | Idem mobile | Deux colonnes : texte gauche / image droite |
| **Catalogue grid** | 2 colonnes | 3 colonnes | 4 colonnes |
| **Card produit** | Image ratio 4/5, nom + prix sous l'image | Idem | Idem + hover reveal CTA "Ajouter" |
| **Filtres catalogue** | Drawer bottom sheet (caché par défaut, bouton "Filtrer") | Drawer latéral gauche | Sidebar fixe gauche |
| **Page produit — galerie** | Carousel swipe (dots en bas) | Carousel swipe large | Grid sticky : vignettes verticales gauche + photo principale + infos sticky droite |
| **Page produit — infos** | En dessous de la galerie, 1 colonne | En dessous, 1 colonne centrée | Colonne droite sticky (scroll indépendant) |
| **Panier drawer** | Full-screen bottom sheet | Panel latéral droit 420px | Panel latéral droit 420px |
| **Checkout** | 1 colonne, stepper en haut, form + résumé empilés | 1 colonne large centrée | 2 colonnes : formulaire gauche / récap sticky droite |
| **Footer** | 4 sections accordéon collapsable + barre logos paiement | 2 colonnes × 2 + barre logos | 4 colonnes : Logo+contact / Catalogue / Aide / Légal + barre logos |
| **Page compte** | 1 colonne, tabs horizontaux | 1 colonne large | 2 colonnes : menu latéral gauche / contenu droite |

---

### 5.3 Règles mobile-first Tailwind

Tout composant s'écrit dans cet ordre — **jamais l'inverse** :

```tsx
// CORRECT — mobile-first
<div className="
  grid grid-cols-2        // mobile : 2 colonnes
  md:grid-cols-3          // tablet : 3 colonnes
  lg:grid-cols-4          // desktop : 4 colonnes
  gap-4 md:gap-6
">

// INTERDIT — desktop-first puis override mobile
<div className="
  grid grid-cols-4
  max-md:grid-cols-2
">
```

---

### 5.4 Typographie responsive

| Élément | Mobile | Tablet (md:) | Desktop (lg:) |
| ------- | ------ | ------------ | ------------- |
| H1 hero | 32px / 1.2 | 40px / 1.15 | 56px / 1.1 |
| H2 section | 24px / 1.3 | 28px / 1.25 | 36px / 1.2 |
| H3 produit | 18px / 1.4 | 20px / 1.35 | 22px / 1.3 |
| Body | 14px / 1.6 | 15px / 1.6 | 16px / 1.7 |
| Prix | 20px DM Mono | 22px | 24px |
| Label bouton | 14px | 14px | 15px |

---

### 5.5 Espacement responsive (8-point grid)

Les paddings de section s'adaptent :

```
Section padding vertical — mobile : 48px / tablet : 64px / desktop : 96px
Section padding horizontal — mobile : 16px / tablet : 24px / desktop : 32px
```

---

### 5.6 Navigation — comportement détaillé

**Mobile (base → md)** — Bottom Tab Bar :

```
Position : fixed bottom-0 left-0 right-0
Hauteur  : 56px + safe-area-inset-bottom (notch iPhone/Android)
Fond     : #1A0A00
Items    : 5 — icône (24px) + label (10px) — espacés uniformément
Active   : icône et label couleur #C9A84C (or)
Inactive : blanc opacité 60%
Badge panier : pastille rouge #C0392B, chiffre blanc 10px
```

**Desktop (lg:)** — Header sticky :

```
Position : sticky top-0, z-index 50
Hauteur  : 72px
Fond     : #1A0A00 (opaque) ou transparent sur hero (transition au scroll)
Layout   : Logo gauche / Nav catégories centre / Icônes droite (Recherche + Compte + Panier)
Ombre au scroll : 0 2px 8px rgba(26,10,0,0.08)
```

---

## 5.7 Standards visuels premium — Niveau Sephora / Fenty / The Ordinary

Le site doit passer le test de la comparaison directe avec ces marques. Chaque écran doit tenir la comparaison côte à côte.

### Photographie produit

- Fond **blanc pur #FFFFFF ou ivoire #FAF6F1** uniquement — cohérence catalogue
- Ratio image produit : **4:5** (portrait) — standard beauté premium
- Minimum **4 visuels par produit** : face, dos, texture, contexte d'usage
- Aucune image < 800px de large — qualité obligatoire
- Alt text descriptif : `"Sérum éclat Ka Cosmetic 30ml — texture dorée"` (pas `"img_product_123"`)

### Micro-interactions (non-négociables)

- **Hover carte produit** : image zoom subtil `scale(1.03)` + transition `300ms ease` + overlay CTA "Ajouter à mon panier"
- **Ajout au panier** : animation checkmark vert 400ms + ouverture drawer (jamais un simple reload)
- **Bouton CTA** : état `loading` avec spinner quand une action async est en cours — désactivé pendant le chargement (anti double-clic)
- **Skeleton screens** : même ratio que le contenu réel — pas de spinners génériques
- **Transitions de page** : fade 150ms entre les routes — pas de flash blanc

### Hiérarchie visuelle premium

- **Espacement généreux** : padding sections 64px mobile / 96px desktop — ne pas compresser
- **Typographie en niveaux** : H1 Cormorant large + corps DM Sans — jamais deux corps du même poids côte à côte
- **Contraste intentionnel** : fond ivoire `#FAF6F1` pour le repos de l'œil, fond sombre `#1A0A00` pour l'impact
- **Or `#C9A84C` utilisé avec parcimonie** : prix, badges "Nouveau", bordures actives, icônes tab actif — pas partout
- **Pas de borders lourdes** : `border: 1px solid #E5D5C5` max — jamais `border: 2px solid`

### Pages clés — exigences premium

**Page produit :**
- Description en **paragraphes riches** avec sections repliables (Ingrédients, Comment l'utiliser, À propos de la marque)
- Section "Vous aimerez aussi" — 4 produits recommandés
- Avis clients avec note étoiles (Phase 2, mais prévoir l'espace dans le layout)

**Homepage hero :**
- Image plein écran haute résolution (min 1920px large)
- Texte en overlay avec `backdrop-blur` léger ou zone sombre semi-transparente — lisibilité garantie
- CTA unique : "Découvrir la collection" — pas deux CTAs concurrents

**Confirmation commande :**
- Page sobre et élégante — pas de confetti ou animations excessives
- Récapitulatif complet : produits commandés + adresse + délai estimé
- Message ton chaleureux-luxe : "Merci pour votre confiance — votre commande est confirmée"

---

## 6. Accessibilité (WCAG AA)

- Contraste texte/fond : minimum 4.5:1 (corps), 3:1 (texte large)
- Touch targets : minimum 44×44px sur mobile
- Focus visible sur tous éléments interactifs (outline #C9A84C 2px)
- Étiquettes ARIA sur panier, modal, formulaires
- Pas de labels-placeholder uniquement (labels visibles obligatoires)
- Navigation clavier complète (Tab, Enter, Escape sur modals/drawers)
- Images produits : alt text descriptifs obligatoires
- Images produits : `loading="lazy"` + blur placeholder (dominant color ou LQIP) — critique sur 3G Abidjan
- Images hero : `loading="eager"` + preload dans le `<head>` — ne pas afficher un écran blanc
- Format images : WebP avec fallback JPEG, max 200KB par image produit

---

## 7. Anti-patterns à éviter (AI Slop Blacklist)

Ces patterns sont INTERDITS dans l'implémentation :

- [ ] Fond dégradé violet/indigo (signal "template SaaS générique")
- [ ] Grid 3 colonnes icône-cercle-coloré + titre + description (= chaque SaaS existant)
- [ ] `text-align: center` sur tout (centrer n'est pas du design)
- [ ] Border-radius uniforme et large partout (bubbly = pas luxe)
- [ ] Blobs décoratifs, cercles flottants, SVG wave dividers
- [ ] Copy générique : "Bienvenue chez Ka Cosmetic", "Votre solution tout-en-un pour..."
- [ ] Section rhythm cookie-cutter (hero → 3 features → testimonials → CTA)
- [ ] system-ui / -apple-system comme police principale

### 7.1 Ton des textes UI — Chaleureux-luxe *(décidé)*

```
CTA principal     : "Découvrir la collection" (jamais "Voir nos produits")
Ajouter panier    : "Ajouter à mon panier"
Ajouter wishlist  : "Ajouter à mes favoris"
Panier vide       : "Votre panier vous attend"
Wishlist vide     : "Sauvegardez vos coups de cœur"
Confirmation cmd  : "Merci pour votre confiance — votre commande est confirmée"
Erreur générique  : "Un instant, nous résolvons cela — réessayez dans quelques secondes"
Empty catalogue   : "Aucun résultat pour ce filtre — élargissez votre recherche"
```

---

## 8. Décisions à résoudre (voir PRD §7)

*(Mises à jour ici au fil de la session design review)*

| # | Décision | Résolution | Notes |
|---|----------|-----------|-------|
| D2 | Navigation mobile | **Bottom tab bar** | Accueil / Catalogue / Recherche / Compte / Panier — fond #1A0A00 |
| D3 | Photos produit | **Grid sticky desktop / carousel mobile** | Sticky colonne gauche desktop, swipe carousel mobile |
| D4 | Checkout flow | **Stepper mono-page** | URL /checkout/[step], progress bar "Étape N/3", 0 rechargement |

