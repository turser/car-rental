import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { translateError, translateErrors } from '../../utils/translateError';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

const extractList = data => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
};

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

export default function ModifierUser() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({ name: '', email: '', role: 'employee', is_active: true });
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        api.get('/users')
            .then(res => {
                const found = extractList(res.data).find(u => String(u.id) === id);
                if (!found) throw new Error();
                setForm({ name: found.name, email: found.email, role: found.role, is_active: Boolean(found.is_active) });
            })
            .catch(() => setError('Utilisateur introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.patch(`/users/${id}`, form);
            navigate('/utilisateurs');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(translateErrors(errors));
            } else {
                setError(translateError(err.response?.data?.message) || 'Erreur lors de la modification.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-7 w-56 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-52 bg-stone-200 rounded-lg animate-pulse" />
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
                    <h1 className="text-xl font-semibold text-stone-900">Modifier l'utilisateur</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Mettez à jour les informations du compte</p>
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
                        <Field label="Nom complet">
                            <input
                                type="text"
                                placeholder="ex : Sara Bennani"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Email">
                            <input
                                type="email"
                                placeholder="ex : sara@agence.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Rôle">
                            <select
                                value={form.role}
                                onChange={e => set('role', e.target.value)}
                                className={inputCls}
                            >
                                <option value="employee">Employé</option>
                                <option value="admin">Administrateur</option>
                                <option value="owner">Propriétaire</option>
                            </select>
                        </Field>
                        <Field label="Statut">
                            <label className="flex items-center gap-2.5 h-full cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={e => set('is_active', e.target.checked)}
                                    className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
                                />
                                <span className="text-sm text-stone-700">Compte actif</span>
                            </label>
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
