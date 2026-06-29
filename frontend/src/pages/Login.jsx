import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// Page de connexion : authentifie l'utilisateur via l'API et redirige vers le dashboard.
export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-[#0b1326] relative overflow-hidden flex flex-col">

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-2.5 px-8 py-7">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <i className="ti ti-car text-white text-[15px]" />
                </div>
                <p className="font-bold text-white text-sm tracking-widest uppercase">CarRental</p>
            </div>

            {/* Décor : points / éclats dispersés */}
            <span className="absolute top-[28%] left-[12%] w-2 h-2 rounded-full bg-slate-600/60" />
            <span className="absolute top-[60%] left-[20%] w-1.5 h-1.5 rounded-full bg-slate-600/50" />
            <span className="absolute top-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-slate-600/50" />
            <span className="absolute top-[68%] right-[10%] w-2 h-2 rounded-full bg-slate-600/60" />
            <i className="ti ti-sparkles absolute top-[22%] right-[22%] text-slate-600/40 text-[18px]" />
            <i className="ti ti-sparkles absolute bottom-[30%] left-[8%] text-slate-600/30 text-[14px]" />

            {/* Contenu central */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-8 pb-24">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-5">
                    <i className="ti ti-car text-white text-[26px]" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 text-center">Connexion</h1>
                <p className="text-sm text-slate-400 mb-8 text-center max-w-xs">
                    Connectez-vous pour gérer votre flotte de location.
                </p>

                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3.5">
                    {error && (
                        <div className="flex items-center gap-2 justify-center bg-red-500/10 text-red-400 text-sm px-3.5 py-2.5 rounded-xl border border-red-500/20">
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
                        className="w-full bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl text-sm text-center focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                        className="w-full bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl text-sm text-center focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 disabled:opacity-50 text-white py-3.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40"
                    >
                        {loading ? 'Connexion…' : 'Se connecter'}
                    </button>
                </form>
            </div>

            {/* Vagues décoratives */}
            <div className="absolute bottom-0 left-0 w-full h-40 sm:h-48 pointer-events-none">
                <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
                    <path fill="#1e293b" d="M0,90 C220,150 420,30 720,70 C1020,110 1240,40 1440,90 L1440,220 L0,220 Z" />
                </svg>
                <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
                    <path fill="#f8fafc" d="M0,140 C260,190 480,110 720,140 C980,172 1200,110 1440,150 L1440,220 L0,220 Z" />
                </svg>
                <p className="absolute bottom-3 w-full text-center text-[11px] text-slate-400">
                    © 2026 CarRental. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}
