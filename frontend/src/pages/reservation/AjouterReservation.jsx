import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { translateError, translateErrors } from '../../utils/translateError';
import { STEPS } from './ajouter/constants';
import Stepper from './ajouter/Stepper';
import StepDates from './ajouter/StepDates';
import StepDetails from './ajouter/StepDetails';
import StepClient from './ajouter/StepClient';
import StepPayment from './ajouter/StepPayment';

// Assistant de création de réservation, en plusieurs étapes (à l'intérieur du Layout habituel).
export default function AjouterReservation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Le sélecteur de disponibilité du dashboard peut transmettre une date seule (sans heure) ;
    // on la complète pour qu'elle reste valide dans un input datetime-local.
    const toDateTimeLocal = (v) => (v && !v.includes('T')) ? `${v}T00:00` : (v || '');

    // L'input datetime-local donne "YYYY-MM-DDTHH:mm" (parfois "YYYY-MM-DDTHH:mm:ss" selon le navigateur) ;
    // l'API attend le format Y-m-d H:i:s (avec secondes, séparateur espace).
    const toApiDateTime = (v) => {
        if (!v) return v;
        const [datePart, timePart = '00:00'] = v.split('T');
        const time = timePart.length === 5 ? `${timePart}:00` : timePart;
        return `${datePart} ${time}`;
    };

    // Avertit si l'assurance/l'impôt du véhicule est absent ou expire avant la fin de la location ;
    // purement informatif, la création de réservation reste validée côté serveur.
    // /available ne renvoie plus les infos assurance/impôt par voiture, donc on les récupère
    // séparément via /insurances et /taxes (mêmes endpoints que les pages Assurances/Impôts).
    const buildCarWarnings = (car, endDate, insurances, taxes) => {
        if (!car || !endDate) return [];
        const warnings = [];
        const end = new Date(endDate);

        const carInsurances = insurances.filter(i => i.car_id === car.id);
        const latestInsurance = carInsurances.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))[0];
        if (!latestInsurance) warnings.push("Aucune assurance enregistrée pour ce véhicule.");
        else if (new Date(latestInsurance.end_date) < end) warnings.push("L'assurance de ce véhicule expire avant la fin de la location.");

        const carTaxes = taxes.filter(t => t.carId === car.id);
        const hasPaidTaxForYear = carTaxes.some(t => t.année === end.getFullYear() && t.payé);
        if (carTaxes.length === 0) warnings.push("Aucun impôt enregistré pour ce véhicule.");
        else if (!hasPaidTaxForYear) warnings.push("L'impôt de ce véhicule n'est pas à jour pour la période de location.");

        return warnings;
    };

    // Même règle que le serveur : le permis doit rester valide jusqu'à 10 jours après la fin de la
    // location (marge de sécurité). S'il n'y a pas de date de permis enregistrée, on ne bloque pas.
    const buildClientWarnings = (client, endDate) => {
        if (!client?.driving_license_expiration || !endDate) return [];
        const safetyDate = new Date(endDate);
        safetyDate.setDate(safetyDate.getDate() + 10);
        return new Date(client.driving_license_expiration) < safetyDate
            ? ["Le permis de conduire de ce client expire trop tôt pour cette période de location."]
            : [];
    };

    const [step, setStep] = useState(0);
    const [dates, setDates] = useState({
        startDate: toDateTimeLocal(location.state?.startDate),
        endDate: toDateTimeLocal(location.state?.expectedReturnDate),
    });
    const [carId, setCarId] = useState(location.state?.carId ? String(location.state.carId) : '');
    const [allCars, setAllCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(true);

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState({}); // { [serviceId]: true }
    const [serviceKm, setServiceKm] = useState({}); // { [serviceId]: km } — quantité envoyée pour les services "par km"
    const [pricePerDay, setPricePerDay] = useState('');

    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');
    const [insurances, setInsurances] = useState([]);
    const [taxes, setTaxes] = useState([]);

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [blockingAlert, setBlockingAlert] = useState(null); // { title, messages, hint }

    const setDate = (key, val) => setDates(d => ({ ...d, [key]: val }));

    const addClient = (client) => {
        setClients(cs => [...cs, client]);
        setClientId(String(client.id));
    };

    const toggleService = (id) => {
        setSelectedServices(prev => {
            const next = { ...prev };
            if (id in next) delete next[id];
            else next[id] = true;
            return next;
        });
    };

    const setServiceKmValue = (id, val) => setServiceKm(prev => ({ ...prev, [id]: val }));

    useEffect(() => {
        // /available (recherche par dates) s'est révélé peu fiable (voitures louées listées à tort,
        // voitures réellement disponibles absentes). On utilise donc directement /cars — la même
        // source que la page Voitures — et on ne garde que celles au statut "available".
        api.get('/cars')
            .then(res => {
                const carsList = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                setAllCars(carsList.map(c => {
                    const img = c.images?.find(i => i.is_primary) || c.images?.[0];
                    return {
                        id: c.id,
                        brand: c.brand,
                        model: c.model,
                        registrationNumber: c.registration_number,
                        dailyPrice: c.daily_price,
                        fuelType: c.fuel_type,
                        mileage: c.mileage,
                        status: c.status,
                        image: img?.image_path ?? null,
                    };
                }));
            })
            .catch(() => {})
            .finally(() => setLoadingCars(false));

        Promise.all([api.get('/createrental'), api.get('/clients')])
            .then(([createRes, clientsRes]) => {
                setServices(createRes.data?.data?.services ?? []);
                const eligibleIds = new Set((createRes.data?.data?.clients ?? []).map(c => c.id));
                const cData = clientsRes.data;
                const clientsList = Array.isArray(cData) ? cData
                    : Array.isArray(cData?.data) ? cData.data
                    : Array.isArray(cData?.data?.data) ? cData.data.data
                    : [];
                setClients(clientsList.filter(c => eligibleIds.has(c.id)));
            })
            .catch(() => {});

        Promise.all([api.get('/insurances'), api.get('/taxes')])
            .then(([insRes, taxRes]) => {
                setInsurances(insRes.data ?? []);
                setTaxes(taxRes.data ?? []);
            })
            .catch(() => {});
    }, []);

    const availableCars = useMemo(() => allCars.filter(c => c.status === 'available'), [allCars]);

    const selectedCar = availableCars.find(c => String(c.id) === String(carId));
    const carImage = selectedCar?.image ?? null;
    const selectedClient = clients.find(c => String(c.id) === String(clientId));

    useEffect(() => {
        if (selectedCar) setPricePerDay(String(selectedCar.dailyPrice));
    }, [selectedCar]);

    const days = useMemo(() => {
        if (!dates.startDate || !dates.endDate) return 0;
        const diff = Math.round((new Date(dates.endDate) - new Date(dates.startDate)) / 86400000);
        return diff > 0 ? diff : 0;
    }, [dates.startDate, dates.endDate]);

    const basePrice = days * (Number(pricePerDay) || 0);

    const servicesTotal = useMemo(() => {
        return Object.keys(selectedServices).reduce((sum, id) => {
            const s = services.find(sv => String(sv.id) === id);
            if (!s) return sum;
            const price = s.priceType === 'per_day' ? s.price * days
                : s.priceType === 'per_km' ? s.price * Number(serviceKm[id] || 0)
                : s.price;
            return sum + Number(price);
        }, 0);
    }, [selectedServices, services, days, serviceKm]);

    const totalPrice = basePrice + servicesTotal;

    const canGoNext = useMemo(() => {
        if (step === 0) return Boolean(dates.startDate && dates.endDate && dates.endDate > dates.startDate && !loadingCars && carId);
        if (step === 1) return Number(pricePerDay) > 0;
        if (step === 2) return Boolean(clientId);
        return true;
    }, [step, dates, loadingCars, carId, pricePerDay, clientId]);

    const goNext = () => {
        if (step === 0) {
            const messages = buildCarWarnings(selectedCar, dates.endDate, insurances, taxes);
            if (messages.length > 0) {
                setBlockingAlert({ title: 'Ce véhicule ne peut pas être réservé', messages, hint: 'Fermez ce message et choisissez un autre véhicule.' });
                return;
            }
        }
        if (step === 2) {
            const messages = buildClientWarnings(selectedClient, dates.endDate);
            if (messages.length > 0) {
                setBlockingAlert({ title: 'Ce client ne peut pas être sélectionné', messages, hint: 'Fermez ce message et choisissez un autre client.' });
                return;
            }
        }
        setStep(s => Math.min(s + 1, STEPS.length - 1));
    };
    const goPrev = () => setStep(s => Math.max(s - 1, 0));

    const isLastStep = step === STEPS.length - 1;

    const handleReserve = async () => {
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                clientId,
                carId,
                startDate: toApiDateTime(dates.startDate),
                expectedReturnDate: toApiDateTime(dates.endDate),
                pricePerDay,
                services: Object.keys(selectedServices).map(id => {
                    const s = services.find(sv => String(sv.id) === id);
                    const quantity = s?.priceType === 'per_km' ? Number(serviceKm[id] || 1) : 1;
                    return { serviceId: Number(id), quantity };
                }),
            };
            if (paidAmount !== '') {
                payload.paidAmount = paidAmount;
                payload.paymentMethod = paymentMethod;
            }

            await api.post('/rentals', payload);
            navigate('/reservations');
        } catch (err) {
            const errors = err.response?.data?.errors;
            setSubmitError(
                errors
                    ? translateErrors(errors)
                    : translateError(err.response?.data?.message) || "Erreur lors de la création de la réservation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Nouvelle réservation</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Étape {step + 1}/{STEPS.length} — {STEPS[step].label}</p>
                </div>
                <button
                    onClick={() => navigate('/reservations')}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-x text-[15px]" />
                </button>
            </div>

            {/* Stepper */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm px-6 py-6 mb-6">
                <Stepper current={step} />
            </div>

            {/* Content */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="bg-white border border-stone-200 rounded-2xl shadow-sm"
            >
                <div className="px-8 py-5 border-b border-stone-100 flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        Étape {step + 1}/{STEPS.length}
                    </span>
                    <span className="text-stone-200">|</span>
                    <h2 className="text-lg font-bold text-stone-900">{STEPS[step].label}</h2>
                </div>

                <div className="px-8 py-8">
                    {step === 0 ? (
                        <StepDates dates={dates} setDate={setDate} cars={availableCars} loadingCars={loadingCars} carId={carId} onSelectCar={setCarId} />
                    ) : step === 1 ? (
                        <StepDetails
                            car={selectedCar}
                            img={carImage}
                            dates={dates}
                            days={days}
                            services={services}
                            selectedServices={selectedServices}
                            toggleService={toggleService}
                            serviceKm={serviceKm}
                            setServiceKm={setServiceKmValue}
                            pricePerDay={pricePerDay}
                            setPricePerDay={setPricePerDay}
                            basePrice={basePrice}
                            servicesTotal={servicesTotal}
                            totalPrice={totalPrice}
                        />
                    ) : step === 2 ? (
                        <StepClient clients={clients} clientId={clientId} onSelectClient={setClientId} onClientCreated={addClient} />
                    ) : (
                        <StepPayment
                            totalPrice={totalPrice}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            paidAmount={paidAmount}
                            setPaidAmount={setPaidAmount}
                        />
                    )}
                </div>

                <div className="px-8 py-5 border-t border-stone-100">
                    {isLastStep && submitError && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-4">
                            <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {submitError}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={step === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            <i className="ti ti-chevron-left text-[15px]" /> Précédent
                        </button>
                        {isLastStep ? (
                            <button
                                type="button"
                                onClick={handleReserve}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                        </svg>
                                        Réservation…
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-check text-[15px]" /> Réserver
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canGoNext}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
                            >
                                Suivant <i className="ti ti-chevron-right text-[15px]" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Alerte bloquante : véhicule (assurance/impôt) ou client (permis) inéligible */}
            {blockingAlert && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setBlockingAlert(null)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <i className="ti ti-alert-triangle text-red-600 text-xl" />
                        </div>
                        <h3 className="text-base font-semibold text-stone-900 mb-2">{blockingAlert.title}</h3>
                        <ul className="space-y-1.5 mb-5">
                            {blockingAlert.messages.map(m => (
                                <li key={m} className="flex items-start gap-2 text-sm text-red-600">
                                    <i className="ti ti-x text-[14px] mt-0.5 flex-shrink-0" /> {m}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-stone-500 mb-4">{blockingAlert.hint}</p>
                        <button
                            type="button"
                            onClick={() => setBlockingAlert(null)}
                            className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
