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

    const [step, setStep] = useState(0);
    const [dates, setDates] = useState({
        startDate: location.state?.startDate || '',
        endDate: location.state?.expectedReturnDate || '',
    });
    const [carId, setCarId] = useState(location.state?.carId ? String(location.state.carId) : '');
    const [cars, setCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [imagesById, setImagesById] = useState({});

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState({}); // { [serviceId]: true }
    const [pricePerDay, setPricePerDay] = useState('');

    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

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

    useEffect(() => {
        // /available ne renvoie pas les photos des voitures ; on les récupère depuis /cars (même source que la page Voitures).
        api.get('/cars')
            .then(res => {
                const carsList = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                const map = Object.fromEntries(carsList.map(c => {
                    const img = c.images?.find(i => i.is_primary) || c.images?.[0];
                    return [c.id, img?.image_path ?? null];
                }));
                setImagesById(map);
            })
            .catch(() => {});

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
    }, []);

    useEffect(() => {
        if (!dates.startDate || !dates.endDate || dates.endDate <= dates.startDate) {
            setCars([]);
            return;
        }
        setLoadingCars(true);
        api.get('/available', { params: { startDate: dates.startDate, endDate: dates.endDate } })
            .then(res => {
                const list = res.data?.data ?? [];
                setCars(list);
                setCarId(id => list.some(c => String(c.id) === String(id)) ? id : '');
            })
            .catch(() => setCars([]))
            .finally(() => setLoadingCars(false));
    }, [dates.startDate, dates.endDate]);

    const selectedCar = cars.find(c => String(c.id) === String(carId));
    const carImage = selectedCar ? (selectedCar.image ?? imagesById[selectedCar.id]) : null;

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
            const price = s.priceType === 'per_day' ? s.price * days : s.price;
            return sum + Number(price);
        }, 0);
    }, [selectedServices, services, days]);

    const totalPrice = basePrice + servicesTotal;

    const canGoNext = useMemo(() => {
        if (step === 0) return Boolean(dates.startDate && dates.endDate && dates.endDate > dates.startDate && !loadingCars && carId);
        if (step === 1) return Number(pricePerDay) > 0;
        if (step === 2) return Boolean(clientId);
        return true;
    }, [step, dates, loadingCars, carId, pricePerDay, clientId]);

    const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const goPrev = () => setStep(s => Math.max(s - 1, 0));

    const isLastStep = step === STEPS.length - 1;

    const handleReserve = async () => {
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload = {
                clientId,
                carId,
                startDate: dates.startDate,
                expectedReturnDate: dates.endDate,
                pricePerDay,
                services: Object.keys(selectedServices).map(id => ({ serviceId: Number(id), quantity: 1 })),
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
                        <StepDates dates={dates} setDate={setDate} cars={cars} loadingCars={loadingCars} carId={carId} onSelectCar={setCarId} imagesById={imagesById} />
                    ) : step === 1 ? (
                        <StepDetails
                            car={selectedCar}
                            img={carImage}
                            dates={dates}
                            days={days}
                            services={services}
                            selectedServices={selectedServices}
                            toggleService={toggleService}
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
        </div>
    );
}
