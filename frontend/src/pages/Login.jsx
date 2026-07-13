import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion';
import api from '../api/api';

// Page de connexion : authentifie l'utilisateur via l'API et redirige vers le dashboard.
export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Halo lumineux qui suit le curseur — position brute côté souris, lissée par un spring
    // pour donner un effet de traînée fluide plutôt qu'un déplacement sec.
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spotX  = useSpring(mouseX, { stiffness: 120, damping: 22, mass: 0.4 });
    const spotY  = useSpring(mouseY, { stiffness: 120, damping: 22, mass: 0.4 });
    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${spotX}px ${spotY}px, rgba(52,211,153,0.20), rgba(16,185,129,0.06) 35%, transparent 65%)`;

    useEffect(() => {
        mouseX.set(window.innerWidth / 2);
        mouseY.set(window.innerHeight / 2);
    }, [mouseX, mouseY]);

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
            dispatch({ type: 'auth/login', payload: { token: res.data.token, user: res.data.user } });
            navigate('/');
        } catch {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-emerald-950 relative overflow-hidden flex flex-col"
        >

            {/* Halo lumineux suivant le curseur */}
            <motion.div
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
                style={{ background: spotlight }}
            />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative z-10 flex items-center gap-2.5 px-8 py-7"
            >
                <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <i className="ti ti-car text-white text-[15px]" />
                </div>
                <p className="font-bold text-white text-sm tracking-widest uppercase">CarRental</p>
            </motion.div>

            {/* Décor : points / éclats dispersés */}
            <span className="absolute top-[28%] left-[12%] w-2 h-2 rounded-full bg-stone-600/60" />
            <span className="absolute top-[60%] left-[20%] w-1.5 h-1.5 rounded-full bg-stone-600/50" />
            <span className="absolute top-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-stone-600/50" />
            <span className="absolute top-[68%] right-[10%] w-2 h-2 rounded-full bg-stone-600/60" />
            <i className="ti ti-sparkles absolute top-[22%] right-[22%] text-stone-600/40 text-[18px]" />
            <i className="ti ti-sparkles absolute bottom-[30%] left-[8%] text-stone-600/30 text-[14px]" />

            {/* Contenu central */}
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-8 pb-24"
            >
                {/* Carte opaque : passe devant le halo pour que celui-ci reste un décor
                    d'arrière-plan et ne transparaisse pas dans les champs. */}
                <div className="relative z-10 w-full max-w-sm bg-emerald-950/95 border border-white/5 rounded-3xl px-8 py-10 shadow-2xl shadow-black/40 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 }}
                        className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-5"
                    >
                        <i className="ti ti-car text-white text-[26px]" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 text-center">Connexion</h1>
                    <p className="text-sm text-stone-400 mb-8 text-center max-w-xs">
                        Connectez-vous pour gérer votre flotte de location.
                    </p>

                    <form onSubmit={handleLogin} className="w-full space-y-3.5">
                        {error && (
                            <div className="flex items-center gap-2 justify-center bg-emerald-500/10 text-emerald-400 text-sm px-3.5 py-2.5 rounded-lg border border-emerald-500/20">
                                <i className="ti ti-alert-circle text-[15px] flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Adresse email"
                            required
                            className="w-full bg-white/5 border border-white/10 text-stone-100 placeholder-stone-500 px-4 py-3 rounded-lg text-sm text-center focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            className="w-full bg-white/5 border border-white/10 text-stone-100 placeholder-stone-500 px-4 py-3 rounded-lg text-sm text-center focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white py-3.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-900/40"
                        >
                            {loading ? 'Connexion…' : 'Se connecter'}
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Vagues décoratives */}
            <div className="absolute bottom-0 left-0 w-full h-40 sm:h-48 pointer-events-none">
                <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
                    <path fill="#01201a" d="M0,90 C220,150 420,30 720,70 C1020,110 1240,40 1440,90 L1440,220 L0,220 Z" />
                </svg>
                <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
                    <path fill="#fafaf9" d="M0,140 C260,190 480,110 720,140 C980,172 1200,110 1440,150 L1440,220 L0,220 Z" />
                </svg>
                <p className="absolute bottom-3 w-full text-center text-[11px] text-stone-400">
                    © 2026 CarRental. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}
