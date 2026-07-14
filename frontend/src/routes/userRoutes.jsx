import Utilisateurs from '../pages/user/Utilisateurs';
import AjouterUser from '../pages/user/AjouterUser';
import ModifierUser from '../pages/user/ModifierUser';
import RoleRoute from '../components/RoleRoute';

// Routes du domaine "utilisateur", à monter dans App.js sous le Layout protégé.
// La liste est accessible en lecture à admin et owner ; l'ajout/modification est réservé à owner.
const userRoutes = [
    { path: '/utilisateurs',              element: <RoleRoute roles={['admin', 'owner']}><Utilisateurs /></RoleRoute> },
    { path: '/utilisateurs/ajouter',       element: <RoleRoute roles={['owner']}><AjouterUser /></RoleRoute> },
    { path: '/utilisateurs/:id/modifier',  element: <RoleRoute roles={['owner']}><ModifierUser /></RoleRoute> },
];

export default userRoutes;
