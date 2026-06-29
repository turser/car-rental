import Clients from '../pages/client/Clients';
import ClientDetail from '../pages/client/ClientDetail';
import AjouterClient from '../pages/client/AjouterClient';

// Routes du domaine "client", à monter dans App.js sous le Layout protégé.
const clientRoutes = [
    { path: '/clients', element: <Clients /> },
    { path: '/clients/ajouter', element: <AjouterClient /> },
    { path: '/clients/:id', element: <ClientDetail /> },
];

export default clientRoutes;
