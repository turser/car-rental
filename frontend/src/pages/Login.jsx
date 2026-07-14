import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion';
import api from '../api/api';
import { translateError } from '../utils/translateError';

// Page de connexion : authentifie l'utilisateur via l'API et redirige vers le dashboard.
export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Effet 3D d'arrière-plan : une ombre noire suit le curseur pour donner une
    // impression de relief, sans toucher au formulaire.
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spotX  = useSpring(mouseX, { stiffness: 120, damping: 22, mass: 0.4 });
    const spotY  = useSpring(mouseY, { stiffness: 120, damping: 22, mass: 0.4 });
    const spotlight = useMotionTemplate`radial-gradient(480px circle at ${spotX}px ${spotY}px, rgba(0,0,0,0.35), transparent 70%)`;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/login', { email, password });
            // /login renvoie parfois un rôle périmé (ex: "admin" au lieu de "owner") ;
            // /me reflète l'état réel de l'utilisateur, donc on s'en sert comme source de vérité.
            let user = res.data.user;
            try {
                const meRes = await api.get('/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
                user = meRes.data;
            } catch (meErr) {
                // Un compte désactivé se connecte avec succès via /login (le backend ne le bloque
                // pas à cette étape) mais /me renvoie 403 juste après : on doit refuser la connexion
                // dans ce cas précis, plutôt que de continuer avec l'utilisateur de /login.
                if (meErr.response?.status === 403) throw meErr;
            }
            dispatch({ type: 'auth/login', payload: { token: res.data.token, user } });
            navigate('/');
        } catch (err) {
            setError(translateError(err.response?.data?.message) || 'Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950"
        >
            <div
                className="absolute inset-0 opacity-[0.1] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
            />
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            {/* Ombre 3D suivant le curseur */}
            <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none blur-2xl"
                style={{ background: spotlight }}
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-0 px-10 py-8 rounded-2xl"
            >
                {/* Bloc gauche — marque */}
                <div className="flex flex-col items-center md:items-end text-center md:text-right md:pr-14 md:border-r border-white/20">
                    <img src="/Hayas-logo.png" alt="Hayas" className="h-28 md:h-36 w-auto object-contain" />
                    <p className="text-sm text-emerald-100/70 mt-4 max-w-[220px]">
                        Gestion de flotte et de réservations
                    </p>
                </div>

                {/* Bloc droit — formulaire */}
                <div className="flex flex-col md:pl-14 w-full max-w-xs">
                    <h2 className="text-white/90 text-lg font-medium mb-5">Connexion</h2>

                    <form onSubmit={handleLogin} className="space-y-3">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 text-red-200 px-3.5 py-2.5 rounded-md border border-red-400/30 text-xs">
                                <i className="ti ti-alert-circle text-[14px] flex-shrink-0" /> {error}
                            </div>
                        )}

                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Adresse e-mail"
                            required
                            className="w-full bg-white text-stone-900 placeholder-stone-400 px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            className="w-full bg-white text-stone-900 placeholder-stone-400 px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                        />

                        <div className="flex items-center justify-between pt-1">
                            <div className="text-xs italic">
                                
                            </div>
                            <motion.button
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-1 text-white font-medium text-sm disabled:opacity-60 transition"
                            >
                                {loading ? 'Connexion…' : 'Connexion'}
                                {!loading && <i className="ti ti-chevron-right text-[16px]" />}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>

            <p className="absolute bottom-5 right-6 text-xs text-emerald-100/50">
                © 2026 Hayas. Tous droits réservés.
            </p>
        </div>
    );
}
