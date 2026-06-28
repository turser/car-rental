import Assurances from '../pages/assurance/Assurances';
import AjouterAssurance from '../pages/assurance/AjouterAssurance';
import ModifierAssurance from '../pages/assurance/ModifierAssurance';

// Routes du domaine "assurance", à monter dans App.js sous le Layout protégé.
const assuranceRoutes = [
    { path: '/assurance', element: <Assurances /> },
    { path: '/assurance/ajouter', element: <AjouterAssurance /> },
    { path: '/assurance/:id/modifier', element: <ModifierAssurance /> },
];

export default assuranceRoutes;
