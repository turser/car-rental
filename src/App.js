import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Voitures from './pages/Voitures';
import VoitureDetail from './pages/VoitureDetail';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Profil from './pages/Profil';
import AjouterVoiture from './pages/AjouterVoiture';

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/"               element={<Dashboard />} />
                        <Route path="/voitures"            element={<Voitures />} />
                        <Route path="/voitures/ajouter" element={<AjouterVoiture />} />
                        <Route path="/voitures/:id"    element={<VoitureDetail />} />
                        <Route path="/profil"          element={<Profil />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}