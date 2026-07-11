// Correspondance URL -> titre affiché dans l'onglet du navigateur.
// Testé dans l'ordre : les motifs les plus spécifiques (avec :id) doivent
// précéder leur version générique pour être trouvés en premier.
const TITLES = [
    { test: /^\/$/,                                     title: 'Tableau de bord' },
    { test: /^\/login$/,                                title: 'Connexion' },
    { test: /^\/profil$/,                                title: 'Mon profil' },
    { test: /^\/parametres$/,                            title: 'Paramètres' },

    { test: /^\/reservations\/calendrier$/,              title: 'Calendrier des réservations' },
    { test: /^\/reservations\/ajouter$/,                 title: 'Ajouter une réservation' },
    { test: /^\/reservations\/[^/]+\/facture$/,          title: 'Facture' },
    { test: /^\/reservations$/,                          title: 'Réservations' },

    { test: /^\/clients\/ajouter$/,                      title: 'Ajouter un client' },
    { test: /^\/clients\/[^/]+$/,                        title: 'Détails client' },
    { test: /^\/clients$/,                               title: 'Clients' },

    { test: /^\/voitures\/ajouter$/,                     title: 'Ajouter une voiture' },
    { test: /^\/voitures\/[^/]+\/modifier$/,             title: 'Modifier la voiture' },
    { test: /^\/voitures\/[^/]+$/,                       title: 'Détails véhicule' },
    { test: /^\/voitures$/,                              title: 'Voitures' },

    { test: /^\/assurance\/ajouter$/,                    title: 'Ajouter une assurance' },
    { test: /^\/assurance\/[^/]+\/modifier$/,            title: 'Modifier une assurance' },
    { test: /^\/assurance$/,                             title: 'Assurances' },

    { test: /^\/impots\/ajouter$/,                       title: 'Ajouter un impôt' },
    { test: /^\/impots\/[^/]+\/modifier$/,               title: 'Modifier un impôt' },
    { test: /^\/impots$/,                                title: 'Impôts' },

    { test: /^\/services\/ajouter$/,                     title: 'Ajouter un service' },
    { test: /^\/services\/[^/]+\/modifier$/,             title: 'Modifier un service' },
    { test: /^\/services$/,                              title: 'Services' },

    { test: /^\/maintenance\/ajouter$/,                  title: 'Ajouter une maintenance' },
    { test: /^\/maintenance\/[^/]+\/modifier$/,          title: 'Modifier une maintenance' },
    { test: /^\/maintenance$/,                           title: 'Maintenance' },

    { test: /^\/utilisateurs\/ajouter$/,                 title: 'Ajouter un utilisateur' },
    { test: /^\/utilisateurs\/[^/]+\/modifier$/,         title: 'Modifier un utilisateur' },
    { test: /^\/utilisateurs$/,                          title: 'Utilisateurs' },
];

export function getPageTitle(pathname) {
    return TITLES.find(({ test }) => test.test(pathname))?.title ?? null;
}
