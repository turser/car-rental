import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profil from './pages/Profil';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PageTitle from './components/PageTitle';
import voitureRoutes from './routes/voitureRoutes';
import clientRoutes from './routes/clientRoutes';
import assuranceRoutes from './routes/assuranceRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import impotRoutes from './routes/impotRoutes';
import serviceRoutes from './routes/serviceRoutes';
import reservationRoutes from './routes/reservationRoutes';
import userRoutes from './routes/userRoutes';

// Point d'entrée de l'application : définit toutes les routes (URLs) et leurs pages associées.
export default function App() {
    return (
        // Provider rend le store Redux (état global : utilisateur connecté, etc.) accessible à toute l'app.
        <Provider store={store}>
            <BrowserRouter>
                <PageTitle />
                <Routes>
                    {/* Page de connexion : accessible uniquement si l'utilisateur N'EST PAS déjà connecté (voir PublicRoute) */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    {/* Toutes les routes ci-dessous nécessitent d'être connecté (ProtectedRoute) et partagent le même
                        Layout (menu latéral, en-tête, etc.) */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/"      element={<Dashboard />} />
                        <Route path="/profil" element={<Profil />} />

                        {/* Routes regroupées par domaine, définies dans src/routes/ */}
                        {voitureRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {clientRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {assuranceRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {maintenanceRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {impotRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {serviceRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {reservationRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                        {userRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
                    </Route>
                    {/* Toute URL inconnue redirige vers la page d'accueil */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}
