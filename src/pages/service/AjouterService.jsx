import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const PRICE_TYPE_OPTIONS = [
    { value: 'fixed',  label: 'Fixe' },
    { value: 'per_km', label: 'Par km' },
    { value: 'per_day', label: 'Par jour' },
];

const inputCls = 'w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition';

function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

// Formulaire d'ajout d'un service.
export default function AjouterService() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        serviceName: '',
        priceType: 'fixed',
        price: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/services', form);
            navigate('/services');
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
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/services')}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Ajouter un service</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Remplissez les informations du service</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-briefcase text-blue-500" /> Détails du service
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Field label="Nom du service" required>
                                <input
                                    type="text"
                                    placeholder="ex : Livraison à domicile"
                                    value={form.serviceName}
                                    onChange={e => set('serviceName', e.target.value)}
                                    required
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                        <Field label="Type de prix" required>
                            <select
                                value={form.priceType}
                                onChange={e => set('priceType', e.target.value)}
                                required
                                className={inputCls}
                            >
                                {PRICE_TYPE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Prix (MAD)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 50"
                                value={form.price}
                                onChange={e => set('price', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/services')}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
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
