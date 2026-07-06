import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function AjouterClient() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nomComplet: '',
        cin: '',
        numeroPermis: '',
        expirationPermis: '',
        telephone: '',
        email: '',
        adresse: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/clients', form);
            navigate('/clients');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(' — '));
            } else {
                setError(err.response?.data?.message || "Erreur lors de l'ajout.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/clients')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Ajouter un client</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Remplissez les informations du client</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identité */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-user text-emerald-500" /> Identité
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nom complet" required>
                            <input
                                type="text"
                                placeholder="ex : Mohamed Alaoui"
                                value={form.nomComplet}
                                onChange={e => set('nomComplet', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="CIN" required>
                            <input
                                type="text"
                                placeholder="ex : AB123456"
                                value={form.cin}
                                onChange={e => set('cin', e.target.value)}
                                required
                                className={`${inputCls} font-mono`}
                            />
                        </Field>
                        <Field label="Numéro de permis" required>
                            <input
                                type="text"
                                placeholder="ex : 12/345678"
                                value={form.numeroPermis}
                                onChange={e => set('numeroPermis', e.target.value)}
                                required
                                className={`${inputCls} font-mono`}
                            />
                        </Field>
                        <Field label="Expiration du permis" required>
                            <input
                                type="date"
                                value={form.expirationPermis}
                                onChange={e => set('expirationPermis', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-address-book text-emerald-500" /> Contact
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Téléphone" required>
                            <input
                                type="tel"
                                placeholder="ex : 0612345678"
                                value={form.telephone}
                                onChange={e => set('telephone', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Email">
                            <input
                                type="email"
                                placeholder="ex : client@email.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Adresse">
                                <input
                                    type="text"
                                    placeholder="ex : 12 Rue Mohammed V, Casablanca"
                                    value={form.adresse}
                                    onChange={e => set('adresse', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/clients')}
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
