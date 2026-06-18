import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

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
            navigate('/dashboard');
        } catch {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <i className="ti ti-car text-white text-[20px]" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-white tracking-wide">CarRental</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Fleet Manager</p>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-7 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-1">Connexion</h2>
                    <p className="text-sm text-slate-400 mb-6">Entrez vos identifiants pour continuer</p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-sm px-3 py-2.5 rounded-lg mb-5 border border-red-500/20">
                            <i className="ti ti-alert-circle text-[15px]" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Adresse email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="vous@exemple.com"
                                required
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-all mt-1"
                        >
                            {loading ? 'Connexion…' : 'Se connecter'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
