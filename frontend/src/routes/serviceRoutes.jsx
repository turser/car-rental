import Services from '../pages/service/Services';
import AjouterService from '../pages/service/AjouterService';
import ModifierService from '../pages/service/ModifierService';

// Routes du domaine "service", à monter dans App.js sous le Layout protégé.
const serviceRoutes = [
    { path: '/services',              element: <Services /> },
    { path: '/services/ajouter',      element: <AjouterService /> },
    { path: '/services/:id/modifier', element: <ModifierService /> },
];

export default serviceRoutes;
