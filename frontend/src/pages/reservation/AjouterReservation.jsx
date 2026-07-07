import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { translateError, translateErrors } from '../../utils/translateError';

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

const fmtPrice = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';

const SERVICE_QTY_LABEL = {
    per_km: 'Quantité (km)',
    per_day: 'Quantité',
    fixed: 'Quantité',
};

function Field({ label, required, hint, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
        </div>
    );
}

// Formulaire d'ajout d'une réservation : sélection client/voiture (disponibles), dates, services additionnels.
export default function AjouterReservation() {
    const navigate = useNavigate();

    const [clients, setClients]   = useState([]);
    const [cars, setCars]         = useState([]);
    const [services, setServices] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [form, setForm] = useState({
        clientId: '',
        carId: '',
        startDate: '',
        expectedReturnDate: '',
        pricePerDay: '',
        paidAmount: '',
    });
    const [selectedServices, setSelectedServices] = useState({}); // { [serviceId]: quantity }
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const [clientQuery, setClientQuery] = useState('');
    const [clientOpen, setClientOpen]   = useState(false);

    useEffect(() => {
        Promise.all([api.get('/createrental'), api.get('/clients')])
            .then(([createRes, clientsRes]) => {
                const eligibleIds = new Set(createRes.data.data.clients.map(c => c.id));
                setClients(clientsRes.data.filter(c => eligibleIds.has(c.id)));
                setCars(createRes.data.data.cars);
                setServices(createRes.data.data.services);
            })
            .catch(() => setError('Erreur lors du chargement du formulaire.'))
            .finally(() => setLoadingData(false));
    }, []);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const selectedCar = cars.find(c => String(c.id) === String(form.carId));

    const filteredClients = clients.filter(c => (c.cin || '').toLowerCase().includes(clientQuery.toLowerCase()));

    const selectClient = (c) => {
        set('clientId', c.id);
        setClientQuery(c.full_name);
        setClientOpen(false);
    };

    const toggleService = (id) => {
        setSelectedServices(prev => {
            const next = { ...prev };
            if (id in next) delete next[id];
            else next[id] = 1;
            return next;
        });
    };
    const setServiceQty = (id, qty) => setSelectedServices(prev => ({ ...prev, [id]: qty }));

    const days = useMemo(() => {
        if (!form.startDate || !form.expectedReturnDate) return 0;
        const start = new Date(form.startDate);
        const end = new Date(form.expectedReturnDate);
        const diff = Math.round((end - start) / 86400000) + 1;
        return diff > 0 ? diff : 0;
    }, [form.startDate, form.expectedReturnDate]);

    const pricePerDay = parseFloat(form.pricePerDay) || selectedCar?.dailyPrice || 0;
    const basePrice = days * pricePerDay;

    const servicesTotal = useMemo(() => {
        return Object.entries(selectedServices).reduce((sum, [id, qty]) => {
            const service = services.find(s => String(s.id) === String(id));
            if (!service || !qty) return sum;
            const unitPrice = service.priceType === 'per_day' ? service.price * days : service.price;
            return sum + unitPrice * Number(qty);
        }, 0);
    }, [selectedServices, services, days]);

    const totalPrice = basePrice + servicesTotal;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.clientId) {
            setError('Veuillez sélectionner un client dans la liste.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                clientId: form.clientId,
                carId: form.carId,
                startDate: form.startDate,
                expectedReturnDate: form.expectedReturnDate,
                services: Object.entries(selectedServices).map(([serviceId, quantity]) => ({
                    serviceId: Number(serviceId),
                    quantity: Number(quantity),
                })),
            };
            if (form.pricePerDay !== '') payload.pricePerDay = form.pricePerDay;
            if (form.paidAmount !== '') payload.paidAmount = form.paidAmount;

            await api.post('/rentals', payload);
            navigate('/reservations');
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

    if (loadingData) return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-7 w-56 bg-stone-200 rounded-sm animate-pulse" />
            <div className="h-64 bg-stone-200 rounded-lg animate-pulse" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/reservations')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Ajouter une réservation</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Remplissez les informations de la location</p>
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
                        <i className="ti ti-calendar-event text-emerald-500" /> Détails de la réservation
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Client" required>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher par CIN…"
                                    value={clientQuery}
                                    onChange={e => { setClientQuery(e.target.value); set('clientId', ''); setClientOpen(true); }}
                                    onFocus={() => setClientOpen(true)}
                                    onBlur={() => setTimeout(() => setClientOpen(false), 100)}
                                    className={`${inputCls} font-mono`}
                                />
                                {clientOpen && clientQuery && (
                                    <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-stone-200 rounded-md shadow-lg">
                                        {filteredClients.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-stone-400">Introuvable.</p>
                                        ) : (
                                            filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onMouseDown={() => selectClient(c)}
                                                    className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-emerald-50 transition"
                                                >
                                                    <span className="font-medium">{c.full_name}</span>
                                                    <span className="ml-2 text-xs font-mono text-stone-400">{c.cin}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </Field>
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
                                        {car.label} — {car.plateNumber} ({fmtPrice(car.dailyPrice)}/j)
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Date de début" required>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={e => set('startDate', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Date de retour prévue" required>
                            <input
                                type="date"
                                value={form.expectedReturnDate}
                                onChange={e => set('expectedReturnDate', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Prix / jour (MAD)" hint="Laisser vide pour utiliser le prix par défaut de la voiture">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={selectedCar ? String(selectedCar.dailyPrice) : 'ex : 350'}
                                value={form.pricePerDay}
                                onChange={e => set('pricePerDay', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Montant payé (MAD)" hint="Laisser vide si rien n'a encore été payé">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 500"
                                value={form.paidAmount}
                                onChange={e => set('paidAmount', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </div>

                {/* Services additionnels */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-briefcase text-emerald-500" /> Services additionnels
                    </h2>
                    {services.length === 0 ? (
                        <p className="text-sm text-stone-400">Aucun service disponible.</p>
                    ) : (
                        <div className="space-y-2">
                            {services.map(s => {
                                const checked = s.id in selectedServices;
                                return (
                                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-md border border-stone-200">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleService(s.id)}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-stone-800">{s.serviceName}</p>
                                            <p className="text-xs text-stone-400">{fmtPrice(s.price)} {s.priceType === 'per_km' ? '/ km' : s.priceType === 'per_day' ? '/ jour' : '(forfait)'}</p>
                                        </div>
                                        {checked && (
                                            <input
                                                type="number"
                                                min="1"
                                                value={selectedServices[s.id]}
                                                onChange={e => setServiceQty(s.id, e.target.value)}
                                                placeholder={SERVICE_QTY_LABEL[s.priceType] || 'Quantité'}
                                                className="w-24 bg-white border border-stone-300 px-2 py-1.5 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Récapitulatif */}
                {days > 0 && form.carId && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
                        <h2 className="text-sm font-semibold text-stone-700 mb-3">Récapitulatif estimé</h2>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-stone-600">
                                <span>Durée</span><span>{days} jour{days > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Prix de base ({fmtPrice(pricePerDay)}/j)</span><span>{fmtPrice(basePrice)}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Services additionnels</span><span>{fmtPrice(servicesTotal)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-stone-900 pt-1.5 border-t border-emerald-100">
                                <span>Total estimé</span><span>{fmtPrice(totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/reservations')}
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
