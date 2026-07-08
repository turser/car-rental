import Utilisateurs from '../pages/user/Utilisateurs';
import AjouterUser from '../pages/user/AjouterUser';
import ModifierUser from '../pages/user/ModifierUser';

// Routes du domaine "utilisateur", à monter dans App.js sous le Layout protégé.
const userRoutes = [
    { path: '/utilisateurs', element: <Utilisateurs /> },
    { path: '/utilisateurs/ajouter', element: <AjouterUser /> },
    { path: '/utilisateurs/:id/modifier', element: <ModifierUser /> },
];

export default userRoutes;
