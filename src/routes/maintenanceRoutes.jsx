import Maintenances from '../pages/maintenance/Maintenances';
import AjouterMaintenance from '../pages/maintenance/AjouterMaintenance';
import ModifierMaintenance from '../pages/maintenance/ModifierMaintenance';

// Routes du domaine "maintenance", à monter dans App.js sous le Layout protégé.
const maintenanceRoutes = [
    { path: '/maintenance',             element: <Maintenances /> },
    { path: '/maintenance/ajouter',     element: <AjouterMaintenance /> },
    { path: '/maintenance/:id/modifier', element: <ModifierMaintenance /> },
];

export default maintenanceRoutes;
