import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TariffDataBuilderService {

  configuration = {
    "meta": {
        "documentType": "tarification",
        "version": "1.0",
        "shared": {
            "nota": {
                "type": "note",
                "style": "warning",
                "title": "Nota",
                "content": [
                    "Pour toute(s) fourniture(s) approvisionnée(s) chez les concessionnaires, la remise sera au maximum égale à 50 % de la remise reçue, et une copie de la facture d'achat sera impérativement jointe à la facture effectuée dans le centre de pose.",
                    "Toutes les remises seront portées en clair sur toutes les factures réalisées."
                ]
            }
        }
    },
    "pages": [
        {
            "id": "page-1",
            "header": {
                "title": "Grille de tarification",
                "subtitleSource": "groupe",
                "pictos": "/assets/img/pictos.png",
                "variant": "main"
            },
            "sections": [
                {
                    "type": "list",
                    "title": "Réparation de pare-brise",
                    "lines": [
                        {
                            "label": "1er impact",
                            "source": {
                                "type": "remise",
                                "key": "I1"
                            },
                            "format": "€"
                        },
                        {
                            "label": "Multi-impacts VL/VU",
                            "source": {
                                "type": "remise",
                                "key": "I5"
                            },
                            "format": "€"
                        }
                    ]
                },
                {
                    "type": "group",
                    "title": "Tarif horaire de main d'œuvre VL",
                    "blocks": [
                        {
                            "type": "text",
                            "label": "Temps de main d'œuvre",
                            "items": [
                                "Pare-brise et lunette : selon barème constructeur (min. 1h)",
                                "Glace latérale : selon barème constructeur (min. 1h30)",
                                "Optique : selon barème constructeur (min. 1h)"
                            ]
                        },
                        {
                            "type": "list",
                            "title": "Province",
                            "vehicle": "vl",
                            "lines": [
                                {
                                    "label": "T1 Travaux courants",
                                    "key": "t1",
                                    "format": "€"
                                },
                                {
                                    "label": "T2 Travaux complexes",
                                    "key": "t2",
                                    "format": "€"
                                },
                                {
                                    "label": "T3 Haute technicité (ADAS)",
                                    "key": "t3",
                                    "format": "€"
                                }
                            ]
                        },
                        {
                            "type": "list",
                            "title": "Île-de-France + Corse",
                            "vehicle": "vl",
                            "regionScope": "idf_corse",
                            "lines": [
                                {
                                    "label": "T1 Travaux courants",
                                    "key": "t1",
                                    "format": "€"
                                },
                                {
                                    "label": "T2 Travaux complexes",
                                    "key": "t2",
                                    "format": "€"
                                },
                                {
                                    "label": "T3 Haute technicité (ADAS)",
                                    "key": "t3",
                                    "format": "€"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "title": "Main d'œuvre PL / Agricole / TP / Transport",
                    "blocks": [
                        {
                            "type": "list",
                            "title": "Province",
                            "vehicle": "pl",
                            "lines": [
                                {
                                    "label": "Travaux courants",
                                    "key": "t1",
                                    "format": "€"
                                },
                                {
                                    "label": "Haute technicité (ADAS)",
                                    "key": "t3",
                                    "format": "€"
                                }
                            ]
                        },
                        {
                            "type": "list",
                            "title": "Île-de-France + Corse",
                            "vehicle": "pl",
                            "regionScope": "idf_corse",
                            "lines": [
                                {
                                    "label": "Travaux courants",
                                    "key": "t1",
                                    "format": "€"
                                },
                                {
                                    "label": "Haute technicité (ADAS)",
                                    "key": "t3",
                                    "format": "€"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "title": "Tarifs pièces et remises",
                    "blocks": [
                        {
                            "type": "list",
                            "lines": [
                                {
                                    "label": "Pare-brise / lunette",
                                    "value": "-25 %"
                                },
                                {
                                    "label": "Joint / enjoliveur",
                                    "value": "-20 %"
                                },
                                {
                                    "label": "Toit en verre",
                                    "value": "-10 %"
                                },
                                {
                                    "label": "Glace latérale",
                                    "value": "-10 %"
                                },
                                {
                                    "label": "Optique phare",
                                    "value": "-10 %"
                                }
                            ]
                        },
                        {
                            "type": "list",
                            "title": "Forfaits",
                            "lines": [
                                {
                                    "label": "Kit collage VL/VU",
                                    "value": "44,82 € HT"
                                },
                                {
                                    "label": "Kit collage PL",
                                    "value": "44,82 € HT"
                                },
                                {
                                    "label": "Fournitures diverses",
                                    "value": "7,25 € HT"
                                },
                                {
                                    "label": "Recyclage pare-brise",
                                    "value": "4,00 € HT"
                                },
                                {
                                    "label": "Traitement déchets",
                                    "value": "1,50 € HT"
                                },
                                {
                                    "label": "Consultation SIDEXA",
                                    "value": "3,00 € HT"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "list",
                    "title": "Forfaits calibration",
                    "lines": [
                        {
                            "label": "Calibration remote pare-brise",
                            "value": "60,00 € HT"
                        },
                        {
                            "label": "Calibration phare matrix",
                            "value": "130,00 € HT"
                        }
                    ]
                },
                {
                    "type": "shared",
                    "ref": "nota"
                }
            ]
        },
        {
            "id": "page-2",
            "header": {
                "title": "Grille de tarification (Annexe)",
                "subtitleSource": "groupe",
                "pictos": "/assets/img/pictos2.png",
                "variant": "annexe"
            },
            "sections": [
                {
                    "type": "list",
                    "title": "Campings cars intégraux, voiturettes & véhicules sans permis",
                    "intro": "Pour les campings spéciaux dits campings car intégraux, les voiturettes et les véhicules sans permis, un coefficient de marge est accordé sous présentation de la facture d’achat de la pièce :",
                    "lines": [
                        {
                            "label": "Pare-brise",
                            "value": "Prix achat × 1,8 − 20 %"
                        },
                        {
                            "label": "Glace latérale",
                            "value": "Prix achat × 1,6 − 10 %"
                        },
                        {
                            "label": "Optique de phare",
                            "value": "Prix achat × 1,6 − 10 %"
                        },
                        {
                            "label": "Kit de collage",
                            "value": "44,82 € HT"
                        },
                        {
                            "label": "Fongibles",
                            "value": "7,25 € HT"
                        },
                        {
                            "label": "Recyclage PB",
                            "value": "4,00 € HT"
                        },
                        {
                            "label": "Recyclage produits dangereux",
                            "value": "1,50 € HT"
                        }
                    ],
                    "outro": [
                        "Temps de M.O. pare-brise : selon les temps constructeurs (max. 6,5h camping-cars, 3h voiturettes).",
                        "Port et Emballage : frais facturés en cas d’achat concessionnaire."
                    ]
                },
                {
                    "type": "list",
                    "title": "Tarif et remises engins agricoles",
                    "lines": [
                        {
                            "label": "Pare-brise / lunette / joint",
                            "value": "Tarif catalogue FPB"
                        },
                        {
                            "label": "Glace latérale",
                            "value": "Tarif catalogue FPB"
                        },
                        {
                            "label": "Optique de phare",
                            "value": "Tarif catalogue FPB"
                        },
                        {
                            "label": "Kit collage",
                            "value": "44,82 € HT"
                        },
                        {
                            "label": "Fongibles",
                            "value": "7,25 € HT"
                        },
                        {
                            "label": "Recyclage PB",
                            "value": "4,00 € HT"
                        },
                        {
                            "label": "Recyclage produits dangereux",
                            "value": "1,50 € HT"
                        },
                        {
                            "label": "Vitrage fourni client",
                            "value": "15 % valeur déclarée"
                        }
                    ]
                },
                {
                    "type": "shared",
                    "ref": "nota"
                },
                {
                    "type": "list",
                    "title": "Tarif et remises transport en commun",
                    "intro": "Les pièces sont tarifées selon les prix constructeurs :",
                    "lines": [
                        {
                            "label": "Pare-brise",
                            "value": "-15 %"
                        },
                        {
                            "label": "Lunettes",
                            "value": "-5 %"
                        },
                        {
                            "label": "Glaces latérales",
                            "value": "-5 %"
                        },
                        {
                            "label": "Joints / moulures",
                            "value": "-15 %"
                        },
                        {
                            "label": "Kit collage",
                            "value": "179,27 € HT"
                        },
                        {
                            "label": "Fongibles",
                            "value": "7,25 € HT"
                        },
                        {
                            "label": "Recyclage PB",
                            "value": "4,00 € HT"
                        },
                        {
                            "label": "Recyclage produits dangereux",
                            "value": "1,50 € HT"
                        },
                        {
                            "label": "Vitrage fourni client",
                            "value": "15 % valeur déclarée"
                        }
                    ]
                },
                {
                    "type": "shared",
                    "ref": "nota"
                }
            ]
        },
        {
            "id": "page-3",
            "header": {
                "title": "Grille de tarification (Annexe)",
                "subtitleSource": "groupe",
                "pictos": "/assets/img/pictos2.png",
                "variant": "annexe"
            },
            "sections": [
                {
                    "type": "list",
                    "title": "Tarif et remises engins de travaux publics",
                    "lines": [
                        {
                            "label": "Pare-brise / lunette / joint / enjoliveur",
                            "value": "Sur devis"
                        },
                        {
                            "label": "Glace latérale",
                            "value": "Sur devis"
                        },
                        {
                            "label": "Optique de phare",
                            "value": "Sur devis"
                        },
                        {
                            "label": "Kit collage",
                            "value": "44,82 € HT"
                        },
                        {
                            "label": "Fongibles",
                            "value": "7,25 € HT"
                        },
                        {
                            "label": "Recyclage PB",
                            "value": "4,00 € HT"
                        },
                        {
                            "label": "Recyclage produits dangereux",
                            "value": "1,50 € HT"
                        },
                        {
                            "label": "Vitrage fourni client",
                            "value": "15 % valeur déclarée"
                        }
                    ]
                },
                {
                    "type": "list",
                    "title": "Déplacements transport en commun, agricole, TP et produits spéciaux",
                    "intro": "En cas de déplacement, les frais sont facturés selon le barème suivant :",
                    "lines": [
                        {
                            "label": "Frais kilométriques",
                            "value": "0,733 € HT / km (min 25 € - max 100 €)"
                        }
                    ]
                },
                {
                    "type": "list",
                    "title": "Rénovation phares en polycarbonate",
                    "subtitle": "(Selon centres équipés)",
                    "lines": [
                        {
                            "label": "Forfait 1 optique",
                            "value": "65,27 € HT"
                        },
                        {
                            "label": "Forfait 2 optiques",
                            "value": "115,18 € HT"
                        }
                    ]
                },
                {
                    "type": "list",
                    "title": "Rétroviseurs",
                    "subtitle": "(Selon centres équipés)",
                    "lines": [
                        {
                            "label": "Remplacement miroir seul",
                            "value": "0,20 heure"
                        },
                        {
                            "label": "Remplacement bloc rétro",
                            "value": "1,00 heure"
                        },
                        {
                            "label": "Peinture coque rétro",
                            "value": "106,92 € HT"
                        }
                    ]
                },
                {
                    "type": "text",
                    "title": "Port et emballage",
                    "content": [
                        "En cas d’achat chez le concessionnaire, les factures seront majorées des éventuels frais de port et d’emballage."
                    ]
                },
                {
                    "type": "signature",
                    "layout": "two-columns",
                    "left": {
                        "title": "Pour France Pare-Brise SAS",
                        "subtitle": "Nom, signature et cachet"
                    },
                    "right": {
                        "title": "Pour le client",
                        "subtitle": "Nom et signature"
                    },
                    "footer": "Fait à {{ville}}, le {{date}}, en deux exemplaires"
                }
            ]
        }
    ]
}
  constructor() { }

}
