import { useEffect, useState } from 'react';
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

// Formulaire d'ajout d'une maintenance, liée à une voiture existante.
export default function AjouterMaintenance() {
    const navigate = useNavigate();

    const [cars, setCars] = useState([]);
    const [form, setForm] = useState({
        carId: '',
        maintenanceType: '',
        maintenanceCost: '',
        maintenanceDate: '',
        currentMileage: '',
        nextDueMileage: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    useEffect(() => {
        api.get('/cars')
            .then(res => setCars(res.data))
            .catch(() => {});
    }, []);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/maintenance', form);
            navigate('/maintenance');
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
                    onClick={() => navigate('/maintenance')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Ajouter une maintenance</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Remplissez les informations de l'intervention</p>
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
                        <i className="ti ti-tool text-emerald-500" /> Détails de l'intervention
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
                        <Field label="Type d'intervention" required>
                            <input
                                type="text"
                                placeholder="ex : Vidange"
                                value={form.maintenanceType}
                                onChange={e => set('maintenanceType', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Date" required>
                            <input
                                type="date"
                                value={form.maintenanceDate}
                                onChange={e => set('maintenanceDate', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Coût (MAD)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 850"
                                value={form.maintenanceCost}
                                onChange={e => set('maintenanceCost', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Kilométrage actuel (km)" required>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                placeholder="ex : 45000"
                                value={form.currentMileage}
                                onChange={e => set('currentMileage', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Prochain Km dû">
                            <input
                                type="number"
                                step="1"
                                min="0"
                                placeholder="ex : 55000"
                                value={form.nextDueMileage}
                                onChange={e => set('nextDueMileage', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/maintenance')}
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
