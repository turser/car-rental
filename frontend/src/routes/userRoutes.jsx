import Utilisateurs from '../pages/user/Utilisateurs';
import AjouterUser from '../pages/user/AjouterUser';
import ModifierUser from '../pages/user/ModifierUser';
import RoleRoute from '../components/RoleRoute';

// Routes du domaine "utilisateur", à monter dans App.js sous le Layout protégé.
// Réservées aux admins : un employé qui tape l'URL directement est renvoyé vers l'accueil.
const userRoutes = [
    { path: '/utilisateurs',              element: <RoleRoute roles={['admin']}><Utilisateurs /></RoleRoute> },
    { path: '/utilisateurs/ajouter',       element: <RoleRoute roles={['admin']}><AjouterUser /></RoleRoute> },
    { path: '/utilisateurs/:id/modifier',  element: <RoleRoute roles={['admin']}><ModifierUser /></RoleRoute> },
];

export default userRoutes;
