import Impots from '../pages/impot/Impots';
import AjouterImpot from '../pages/impot/AjouterImpot';
import ModifierImpot from '../pages/impot/ModifierImpot';

// Routes du domaine "impot", à monter dans App.js sous le Layout protégé.
const impotRoutes = [
    { path: '/impots',               element: <Impots /> },
    { path: '/impots/ajouter',       element: <AjouterImpot /> },
    { path: '/impots/:id/modifier',  element: <ModifierImpot /> },
];

export default impotRoutes;
