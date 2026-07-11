import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Restreint une route à une liste de rôles ; les autres utilisateurs sont renvoyés vers redirectTo.
// Usage : <RoleRoute roles={['admin']}><AjouterVoiture /></RoleRoute>
export default function RoleRoute({ roles, redirectTo = '/', children }) {
    const role = useSelector(state => state.auth.user?.role);
    return roles.includes(role) ? children : <Navigate to={redirectTo} replace />;
}
