import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';

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

// Formulaire de modification d'un impôt existant : pré-remplit les champs depuis l'API puis envoie les changements.
export default function ModifierImpot() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [cars, setCars] = useState([]);
    const [form, setForm] = useState({
        carId: '',
        année: new Date().getFullYear(),
        montant: '',
        date_d_échéance: '',
        payé: false,
    });
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        Promise.all([api.get('/taxes'), api.get('/cars')])
            .then(([taxesRes, carsRes]) => {
                const tax = taxesRes.data.find(t => String(t.id) === id);
                if (!tax) {
                    console.error('Impôt non trouvé. id recherché:', id, 'ids reçus:', taxesRes.data.map(t => t.id));
                    throw new Error('not-found');
                }
                setForm({
                    carId: tax.carId || '',
                    année: tax.année || new Date().getFullYear(),
                    montant: tax.montant || '',
                    date_d_échéance: tax.date_d_échéance ? tax.date_d_échéance.slice(0, 10) : '',
                    payé: !!tax.payé,
                });
                setCars(carsRes.data);
            })
            .catch(err => {
                console.error('Erreur de chargement de l\'impôt:', err);
                setError(err.message === 'not-found' ? 'Impôt introuvable.' : 'Erreur lors du chargement de l\'impôt.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.patch(`/taxes/${id}`, form);
            navigate('/impots');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(' — '));
            } else {
                setError(err.response?.data?.message || 'Erreur lors de la modification.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-7 w-56 bg-slate-200 rounded animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/impots')}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Modifier l'impôt</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Mettez à jour les informations de la taxe</p>
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
                        <i className="ti ti-receipt-tax text-blue-500" /> Détails de l'impôt
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Field label="Voiture" required>
                                <select
                                    value={form.carId}
                                    onChange={e => set('carId', e.target.value)}
                                    required
                                    className={inputCls}
                                >
                                    <option value="" disabled>Sélectionner une voiture</option>
                                    {cars.map(car => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} {car.model} — {car.registration_number}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Année" required>
                            <input
                                type="number"
                                step="1"
                                min="2000"
                                max={new Date().getFullYear() + 1}
                                value={form.année}
                                onChange={e => set('année', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Montant (MAD)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 1200"
                                value={form.montant}
                                onChange={e => set('montant', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Date d'échéance" required>
                            <input
                                type="date"
                                value={form.date_d_échéance}
                                onChange={e => set('date_d_échéance', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Statut">
                            <select
                                value={form.payé ? '1' : '0'}
                                onChange={e => set('payé', e.target.value === '1')}
                                className={inputCls}
                            >
                                <option value="0">Non payé</option>
                                <option value="1">Payé</option>
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/impots')}
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
