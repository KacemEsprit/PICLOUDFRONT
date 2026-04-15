import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  generateContractClauses(
    partnerName: string,
    partnerSector: string,
    orgName: string,
    orgType: string,
    contractType: string,
    durationMonths: number
  ): Observable<any> {

    const clauses = this.buildClauses(partnerName, partnerSector, orgName, orgType, contractType, durationMonths);
    return of({ candidates: [{ content: { parts: [{ text: JSON.stringify({ clauses }) }] } }] });
  }

  private buildClauses(
    partnerName: string,
    partnerSector: string,
    orgName: string,
    orgType: string,
    contractType: string,
    durationMonths: number
  ): any[] {

    const clauses = [
      {
        numero: 1,
        titre: "Objet du Contrat",
        contenu: `Le présent contrat de partenariat ${contractType} est conclu entre ${orgName}, opérateur de transport public de type ${orgType} en Tunisie, et ${partnerName}, acteur du secteur ${partnerSector}. Ce partenariat vise à établir un cadre de collaboration mutuelle pour améliorer les services de transport public sur le territoire tunisien, conformément aux dispositions de la loi tunisienne sur le transport public n°2004-33.`
      },
      {
        numero: 2,
        titre: "Durée et Renouvellement",
        contenu: `Le présent contrat prend effet à la date de signature et est conclu pour une durée de ${durationMonths} mois. À l'expiration de cette période, le contrat pourra être renouvelé par accord mutuel des parties, sous réserve d'un préavis écrit de 30 jours avant la date d'échéance. ${orgName} et ${partnerName} s'engagent à respecter les délais de notification pour tout renouvellement ou résiliation.`
      },
      {
        numero: 3,
        titre: "Obligations des Parties",
        contenu: `${orgName} s'engage à fournir à ${partnerName} un accès privilégié à son réseau de transport ${orgType} et à collaborer activement pour le développement des services. ${partnerName} s'engage en contrepartie à apporter son expertise dans le domaine ${partnerSector}, à respecter les normes de qualité de service de TransitTN, et à maintenir la confidentialité des informations échangées dans le cadre de ce partenariat.`
      },
      {
        numero: 4,
        titre: "Conditions Financières et Facturation",
        contenu: `Les modalités financières de ce partenariat ${contractType} seront définies dans une annexe tarifaire séparée, signée conjointement par les représentants légaux des deux parties. Les paiements seront effectués selon un calendrier trimestriel, avec émission de factures conformes à la réglementation fiscale tunisienne. Tout retard de paiement supérieur à 30 jours entraînera l'application de pénalités conformément au taux légal en vigueur en Tunisie.`
      },
      {
        numero: 5,
        titre: "Résolution des Litiges et Droit Applicable",
        contenu: `En cas de litige entre ${orgName} et ${partnerName} relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours. À défaut d'accord amiable, le litige sera soumis à la juridiction compétente de Tunis, conformément au droit tunisien en vigueur. Le présent contrat est régi par la législation tunisienne et la plateforme TransitTN agira en tant que médiateur en première instance.`
      }
    ];

    // Ajouter une clause spécifique selon le secteur
    if (partnerSector === 'TECHNOLOGY' || partnerSector === 'FINANCIAL') {
      clauses.push({
        numero: 6,
        titre: partnerSector === 'TECHNOLOGY' ? "Intégration Technologique et Sécurité des Données" : "Conditions de Paiement et Services Financiers",
        contenu: partnerSector === 'TECHNOLOGY'
          ? `${partnerName} s'engage à intégrer ses solutions technologiques avec le système d'information de ${orgName} dans le respect des normes de sécurité ISO 27001. Les données des usagers du transport public collectées dans le cadre de ce partenariat seront traitées conformément à la loi tunisienne sur la protection des données personnelles. ${partnerName} devra obtenir une certification de conformité auprès de l'Instance Nationale de Protection des Données Personnelles (INPDP) avant tout déploiement.`
          : `${partnerName} s'engage à faciliter les transactions financières liées aux services de ${orgName} dans le respect des réglementations de la Banque Centrale de Tunisie. Les modalités de commission, les délais de règlement et les garanties bancaires seront définies en conformité avec la circulaire BCT applicable aux partenariats de transport public. ${partnerName} maintiendra une couverture d'assurance adéquate pour toutes les opérations financières conduites dans le cadre de ce partenariat.`
      });
    }

    return clauses;
  }
}
