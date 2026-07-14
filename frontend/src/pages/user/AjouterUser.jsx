import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { translateError, translateErrors } from '../../utils/translateError';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                {label}{required && <span className="text-emerald-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function AjouterUser() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'employee',
        is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');
    const [created, setCreated]       = useState(null);
    const [copied, setCopied]         = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await api.post('/users', form);
            setCreated(res.data?.data ?? res.data);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(translateErrors(errors));
            } else {
                setError(translateError(err.response?.data?.message) || "Erreur lors de l'ajout.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(created.generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (created) return (
        <div className="max-w-lg mx-auto">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <i className="ti ti-check text-[22px]" />
                </div>
                <h1 className="text-lg font-semibold text-stone-900">Utilisateur créé</h1>
                <p className="text-sm text-stone-500 mt-1">Partagez ces identifiants avec {created.name} — le mot de passe ne sera plus affiché ensuite.</p>

                <div className="mt-5 text-left space-y-3 bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs font-medium text-stone-500">ID</p>
                            <p className="text-sm text-stone-900 font-mono">{created.id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-stone-500">Rôle</p>
                            <p className="text-sm text-stone-900">{created.role}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-stone-500">Nom</p>
                            <p className="text-sm text-stone-900">{created.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-stone-500">Agence</p>
                            <p className="text-sm text-stone-900 font-mono">{created.agencyId}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-medium text-stone-500">Email</p>
                            <p className="text-sm text-stone-900 font-mono">{created.email}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-stone-500">Mot de passe généré</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="flex-1 text-sm text-stone-900 font-mono bg-white border border-stone-200 rounded-md px-3 py-2">
                                {created.generatedPassword}
                            </p>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="w-9 h-9 flex-shrink-0 rounded-md border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-white transition"
                                title="Copier"
                            >
                                <i className={`ti ${copied ? 'ti-check text-emerald-600' : 'ti-copy'} text-[15px]`} />
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/utilisateurs')}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-sm"
                >
                    Terminé
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/utilisateurs')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Ajouter un utilisateur</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Un mot de passe sera généré automatiquement</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-user text-emerald-500" /> Informations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nom complet" required>
                            <input
                                type="text"
                                placeholder="ex : Sara Bennani"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Email" required>
                            <input
                                type="email"
                                placeholder="ex : sara@agence.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Rôle" required>
                            <select
                                value={form.role}
                                onChange={e => set('role', e.target.value)}
                                required
                                className={inputCls}
                            >
                                <option value="employee">Employé</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/utilisateurs')}
                        className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                </svg>
                                Enregistrement…
                            </>
                        ) : (
                            <>
                                <i className="ti ti-check text-[15px]" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
