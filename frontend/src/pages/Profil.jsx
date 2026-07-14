import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../api/api';
import { translateError, translateErrors } from '../utils/translateError';

const ROLE = {
    owner:    { label: 'Propriétaire',   cls: 'bg-amber-50 text-amber-700 border border-amber-100',   icon: 'ti-crown' },
    admin:    { label: 'Administrateur', cls: 'bg-violet-50 text-violet-700 border border-violet-100', icon: 'ti-shield-star' },
    agent:    { label: 'Agent',          cls: 'bg-indigo-50 text-indigo-700 border border-indigo-100', icon: 'ti-shield-check' },
    employee: { label: 'Employé',        cls: 'bg-indigo-50 text-indigo-700 border border-indigo-100', icon: 'ti-shield-check' },
};

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

export default function Profil() {
    const user = useSelector(state => state.auth.user);

    const [pwd, setPwd]                 = useState({ password: '', password_confirmation: '' });
    const [pwdSubmitting, setPwdSubmitting] = useState(false);
    const [pwdError, setPwdError]       = useState('');
    const [pwdSuccess, setPwdSuccess]   = useState('');

    if (!user) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-stone-400 text-sm">Aucun utilisateur trouvé.</p>
        </div>
    );

    const role     = ROLE[user.role] || { label: user.role, cls: 'bg-stone-100 text-stone-600 border border-stone-200', icon: 'ti-user' };
    const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');
        setPwdSubmitting(true);
        try {
            const res = await api.patch(`/users/${user.id}/reset-password`, pwd);
            setPwdSuccess(translateError(res.data?.message) || 'Mot de passe réinitialisé avec succès.');
            setPwd({ password: '', password_confirmation: '' });
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setPwdError(translateErrors(errors));
            } else {
                setPwdError(translateError(err.response?.data?.message) || 'Erreur lors de la réinitialisation.');
            }
        } finally {
            setPwdSubmitting(false);
        }
    };

    const infoTiles = [
        { label: 'Nom complet', value: user.name,  icon: 'ti-user' },
        { label: 'Email',       value: user.email, icon: 'ti-mail' },
        { label: 'Agence',      value: user.agency?.name ?? user.agency_name ?? '—', icon: 'ti-building' },
    ];

    return (
        <div className="max-w-6xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-stone-900">Mon profil</h1>
                <p className="text-sm text-stone-500 mt-0.5">Gérez vos informations et la sécurité de votre compte</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Colonne gauche — carte identité */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl shadow-sm lg:sticky lg:top-8"
                >
                    <div className="relative h-28 rounded-t-2xl overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500">
                        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
                    </div>
                    <div className="px-6 pb-6 text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
                            className="w-20 h-20 mx-auto -mt-10 rounded-2xl bg-emerald-700 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                        >
                            {initials}
                        </motion.div>

                        <p className="font-semibold text-stone-900 text-lg mt-3">{user.name}</p>
                        <p className="text-sm text-stone-500">{user.email}</p>

                        <span className={`inline-flex items-center gap-1.5 mt-3 text-xs px-2.5 py-1 rounded-full font-medium ${role.cls}`}>
                            <i className={`ti ${role.icon} text-[13px]`} /> {role.label}
                        </span>

                        <div className="mt-5 pt-5 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Compte actif
                        </div>
                    </div>
                </motion.div>

                {/* Colonne droite — infos + sécurité */}
                <div className="lg:col-span-2 space-y-6">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
                        className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
                    >
                        <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                            <i className="ti ti-address-book text-emerald-500" /> Informations du compte
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {infoTiles.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 + index * 0.05 }}
                                    className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <i className={`ti ${item.icon} text-[16px]`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-stone-500">{item.label}</p>
                                        <p className="text-sm font-medium text-stone-900 truncate">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                        className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
                    >
                        <h2 className="text-sm font-semibold text-stone-700 mb-1 flex items-center gap-2">
                            <i className="ti ti-lock text-emerald-500" /> Réinitialiser le mot de passe
                        </h2>
                        <p className="text-xs text-stone-500 mb-4">Choisissez un nouveau mot de passe d'au moins 8 caractères.</p>

                        {pwdError && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-4">
                                <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {pwdError}
                            </div>
                        )}
                        {pwdSuccess && (
                            <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100 text-sm mb-4">
                                <i className="ti ti-check mt-0.5 flex-shrink-0" /> {pwdSuccess}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                        Nouveau mot de passe<span className="text-emerald-500 ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        minLength={8}
                                        required
                                        placeholder="8 caractères minimum"
                                        value={pwd.password}
                                        onChange={e => setPwd(f => ({ ...f, password: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-600 mb-1.5">
                                        Confirmer le mot de passe<span className="text-emerald-500 ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        minLength={8}
                                        required
                                        placeholder="Retapez le mot de passe"
                                        value={pwd.password_confirmation}
                                        onChange={e => setPwd(f => ({ ...f, password_confirmation: e.target.value }))}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={pwdSubmitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
                                >
                                    {pwdSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                            </svg>
                                            Réinitialisation…
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-lock text-[15px]" />
                                            Réinitialiser
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
