// Traduit en français les messages d'erreur renvoyés tels quels par le backend (anglais) :
// messages de validation Laravel (couverture générique de toutes les règles standard)
// + messages métier personnalisés déjà identifiés dans l'API. Un message totalement
// inédit (non listé/reconnu) est retourné sans modification.

const EXACT_MATCHES = {
    'Invalid credentials': 'Email ou mot de passe incorrect.',
    'Driving license will expire too soon for this rental period.': 'Le permis de conduire du client expire trop tôt pour cette période de location.',
    'This car does not belong to your agency.': 'Cette voiture n\'appartient pas à votre agence.',
    'Car is not available.': 'Cette voiture n\'est pas disponible.',
    'Car insurance will expire before or shortly after the rental ends.': 'L\'assurance de la voiture expire avant ou peu après la fin de la location.',
    'Rental creation failed.': 'La création de la réservation a échoué.',
    'Rental created successfully.': 'Réservation créée avec succès.',
    'A tax record already exists for this car in the given year.': 'Un impôt existe déjà pour cette voiture pour cette année.',
    'This user does not belong to your agency.': 'Cet utilisateur n\'appartient pas à votre agence.',
    'User created successfully.': 'Utilisateur créé avec succès.',
    'User updated successfully.': 'Utilisateur mis à jour avec succès.',
    'Password reset successfully.': 'Mot de passe réinitialisé avec succès.',
};

// Couverture générique des messages de validation Laravel par défaut (resources/lang/en/validation.php).
// Chaque règle -> (champ, ...params) => phrase française. L'ordre compte : du plus spécifique au plus générique.
const PATTERN_MATCHES = [
    [/^Car tax is not paid for the year (\d+)\.$/, (_, year) => `L'impôt de la voiture n'est pas payé pour l'année ${year}.`],

    [/^The (.+) field is required when (.+) is (.+)\.$/, (_, f, other, val) => `${f} est requis lorsque ${other} vaut ${val}.`],
    [/^The (.+) field is required unless (.+) is in (.+)\.$/, (_, f, other, vals) => `${f} est requis sauf si ${other} fait partie de ${vals}.`],
    [/^The (.+) field is required when (.+) is present\.$/, (_, f, other) => `${f} est requis lorsque ${other} est renseigné.`],
    [/^The (.+) field is required\.$/, (_, f) => `Le champ ${f} est requis.`],

    [/^The (.+) has already been taken\.$/, (_, f) => `${f} est déjà utilisé.`],
    [/^The selected (.+) is invalid\.$/, (_, f) => `${f} sélectionné est invalide.`],

    [/^The (.+) must be a date after or equal to (.+)\.$/, (_, f, d) => `${f} doit être une date après ou égale à ${d}.`],
    [/^The (.+) must be a date before or equal to (.+)\.$/, (_, f, d) => `${f} doit être une date avant ou égale à ${d}.`],
    [/^The (.+) must be a date after (.+)\.$/, (_, f, d) => `${f} doit être une date après ${d}.`],
    [/^The (.+) must be a date before (.+)\.$/, (_, f, d) => `${f} doit être une date avant ${d}.`],
    [/^The (.+) must be a date equal to (.+)\.$/, (_, f, d) => `${f} doit être une date égale à ${d}.`],
    [/^The (.+) does not match the format (.+)\.$/, (_, f, fmt) => `${f} ne correspond pas au format ${fmt}.`],
    [/^The (.+) is not a valid date\.$/, (_, f) => `${f} n'est pas une date valide.`],
    [/^The (.+) must be a valid date\.$/, (_, f) => `${f} doit être une date valide.`],

    [/^The (.+) must be a valid email address\.$/, (_, f) => `${f} doit être une adresse email valide.`],
    [/^The (.+) format is invalid\.$/, (_, f) => `${f} n'est pas dans un format valide.`],
    [/^The (.+) is not a valid URL\.$/, (_, f) => `${f} n'est pas une URL valide.`],

    [/^The (.+) and (.+) must be different\.$/, (_, f, other) => `${f} et ${other} doivent être différents.`],
    [/^The (.+) and (.+) must match\.$/, (_, f, other) => `${f} et ${other} doivent être identiques.`],
    [/^The (.+) confirmation does not match\.$/, (_, f) => `La confirmation de ${f} ne correspond pas.`],

    [/^The (.+) must be between (\d+) and (\d+) characters\.$/, (_, f, min, max) => `${f} doit contenir entre ${min} et ${max} caractères.`],
    [/^The (.+) must be between (\d+) and (\d+)\.$/, (_, f, min, max) => `${f} doit être compris entre ${min} et ${max}.`],
    [/^The (.+) must be at least (\d+) characters\.$/, (_, f, n) => `${f} doit contenir au moins ${n} caractères.`],
    [/^The (.+) must not be greater than (\d+) characters\.$/, (_, f, n) => `${f} ne doit pas dépasser ${n} caractères.`],
    [/^The (.+) must be at least (\d+)\.$/, (_, f, n) => `${f} doit être au moins ${n}.`],
    [/^The (.+) must not be greater than (\d+)\.$/, (_, f, n) => `${f} ne doit pas dépasser ${n}.`],
    [/^The (.+) must be (\d+) characters\.$/, (_, f, n) => `${f} doit contenir ${n} caractères.`],
    [/^The (.+) must be (\d+) digits\.$/, (_, f, n) => `${f} doit contenir ${n} chiffres.`],
    [/^The (.+) must be between (\d+) and (\d+) digits\.$/, (_, f, min, max) => `${f} doit contenir entre ${min} et ${max} chiffres.`],
    [/^The (.+) must be (\d+)\.$/, (_, f, n) => `${f} doit être égal à ${n}.`],

    [/^The (.+) field must be true or false\.$/, (_, f) => `${f} doit être vrai ou faux.`],
    [/^The (.+) must be an integer\.$/, (_, f) => `${f} doit être un entier.`],
    [/^The (.+) must be a number\.$/, (_, f) => `${f} doit être un nombre.`],
    [/^The (.+) must be a string\.$/, (_, f) => `${f} doit être une chaîne de caractères.`],
    [/^The (.+) must be an array\.$/, (_, f) => `${f} doit être une liste.`],
    [/^The (.+) must be an image\.$/, (_, f) => `${f} doit être une image.`],
    [/^The (.+) must be accepted\.$/, (_, f) => `${f} doit être accepté.`],
    [/^The (.+) must only contain letters\.$/, (_, f) => `${f} ne doit contenir que des lettres.`],
    [/^The (.+) must only contain letters, numbers, dashes and underscores\.$/, (_, f) => `${f} ne doit contenir que des lettres, chiffres, tirets et underscores.`],
    [/^The (.+) must only contain letters and numbers\.$/, (_, f) => `${f} ne doit contenir que des lettres et des chiffres.`],
];

export function translateError(message) {
    if (!message) return message;

    if (message in EXACT_MATCHES) return EXACT_MATCHES[message];

    for (const [pattern, build] of PATTERN_MATCHES) {
        const match = message.match(pattern);
        if (match) return build(...match);
    }

    return message;
}

// Traduit chaque message d'un objet d'erreurs de validation Laravel ({ field: [msg, ...] }).
export function translateErrors(errors) {
    return Object.values(errors).flat().map(translateError).join(' — ');
}