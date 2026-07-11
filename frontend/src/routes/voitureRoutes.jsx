import Voitures from '../pages/voiture/Voitures';
import VoitureDetail from '../pages/voiture/VoitureDetail';
import AjouterVoiture from '../pages/voiture/AjouterVoiture';
import ModifierVoiture from '../pages/voiture/ModifierVoiture';
import RoleRoute from '../components/RoleRoute';

// Routes du domaine "voiture", à monter dans App.js sous le Layout protégé.
const voitureRoutes = [
    { path: '/voitures', element: <Voitures /> },
    { path: '/voitures/ajouter', element: <RoleRoute roles={['admin']} redirectTo="/voitures"><AjouterVoiture /></RoleRoute> },
    { path: '/voitures/:id/modifier', element: <ModifierVoiture /> },
    { path: '/voitures/:id', element: <VoitureDetail /> },
];

export default voitureRoutes;
