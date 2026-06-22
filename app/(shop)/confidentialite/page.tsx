import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Politique de confidentialité — Ka Cosmetic",
  description: "Comment Ka Cosmetic collecte, utilise et protège vos données personnelles.",
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mb-8">
      <h2 className="font-display mb-3 text-lg font-semibold text-ebene">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-taupe">{children}</div>
    </section>
  )
}

export default function ConfidentialitePage() {
  return (
    <div className="bg-ivoire">
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Confidentialité</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Légal</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Politique de confidentialité</h1>
          <p className="mt-3 text-sm text-taupe">Dernière mise à jour : janvier 2025</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">

        <Section title="1. Responsable du traitement">
          <p>
            Ka Cosmetic, société établie à Abidjan, Côte d'Ivoire, est responsable du traitement des
            données personnelles collectées sur le site <strong className="text-ebene">kacosmetic.ci</strong>.
          </p>
          <p>
            Contact : <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a>
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong className="text-ebene">Données d'identité</strong> : nom, prénom, adresse email</li>
            <li><strong className="text-ebene">Données de contact</strong> : numéro de téléphone, adresse de livraison</li>
            <li><strong className="text-ebene">Données de commande</strong> : produits commandés, montants, statuts</li>
            <li><strong className="text-ebene">Données de navigation</strong> : adresse IP, pages visitées, durée de session (via cookies techniques)</li>
            <li><strong className="text-ebene">Données de compte</strong> : si vous créez un compte, votre email et historique de commandes</li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>Vos données sont utilisées pour :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Traiter et livrer vos commandes</li>
            <li>Vous envoyer des confirmations et mises à jour par email et SMS</li>
            <li>Gérer votre compte client et votre liste de souhaits</li>
            <li>Vous envoyer notre newsletter (avec votre consentement)</li>
            <li>Améliorer notre site et nos services</li>
            <li>Respecter nos obligations légales et comptables</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement est fondé sur :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>L'exécution du contrat de vente (traitement des commandes)</li>
            <li>Votre consentement (newsletter, cookies non essentiels)</li>
            <li>Nos intérêts légitimes (amélioration du service, prévention de la fraude)</li>
          </ul>
        </Section>

        <Section title="5. Conservation des données">
          <p>
            Vos données de commande sont conservées pendant <strong className="text-ebene">5 ans</strong> à
            compter de la commande pour des raisons comptables et légales. Vos données de compte sont
            conservées tant que votre compte est actif. Les données de newsletter sont supprimées sur demande.
          </p>
        </Section>

        <Section title="6. Partage des données">
          <p>Vos données peuvent être partagées avec :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong className="text-ebene">Jeko Africa</strong> : pour le traitement sécurisé des paiements</li>
            <li><strong className="text-ebene">Resend</strong> : pour l'envoi des emails transactionnels</li>
            <li><strong className="text-ebene">Twilio</strong> : pour l'envoi des notifications SMS</li>
            <li><strong className="text-ebene">Cloudinary</strong> : pour le stockage des images</li>
          </ul>
          <p>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</p>
        </Section>

        <Section title="7. Vos droits">
          <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong className="text-ebene">Droit d'accès</strong> : connaître les données que nous détenons sur vous</li>
            <li><strong className="text-ebene">Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong className="text-ebene">Droit à l'effacement</strong> : demander la suppression de vos données</li>
            <li><strong className="text-ebene">Droit d'opposition</strong> : vous opposer à certains traitements</li>
            <li><strong className="text-ebene">Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">contact@kacosmetic.ci</a>.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Notre site utilise uniquement des cookies techniques nécessaires au fonctionnement (session,
            panier). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          </p>
        </Section>

        <Section title="9. Sécurité">
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            connexions chiffrées (HTTPS), accès restreint aux données, authentification sécurisée.
          </p>
        </Section>

        <div className="mt-8 border-t border-or/20 pt-6 text-sm text-taupe">
          <p>
            Pour toute question, contactez-nous à{" "}
            <a href="mailto:contact@kacosmetic.ci" className="text-or hover:underline">
              contact@kacosmetic.ci
            </a>{" "}
            ou via notre{" "}
            <Link href="/contact" className="text-or hover:underline">formulaire de contact</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
