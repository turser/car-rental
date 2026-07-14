import { fmtMAD, fmtDate } from './constants';

export default function StepDetails({ car, img, dates, days, services, selectedServices, toggleService, serviceKm, setServiceKm, pricePerDay, setPricePerDay, basePrice, servicesTotal, totalPrice }) {
    const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Récap véhicule + dates */}
            <div className="lg:col-span-1">
                <div className="rounded-xl overflow-hidden bg-stone-100 h-40">
                    {img ? (
                        <img src={img} alt={`${car?.brand} ${car?.model}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="ti ti-car text-stone-300 text-3xl" />
                        </div>
                    )}
                </div>
                <p className="font-bold text-stone-900 mt-3">{car?.brand} {car?.model}</p>
                <p className="font-mono text-sm text-stone-400">{car?.registrationNumber}</p>

                <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-stone-500">Début</span>
                        <span className="font-medium text-stone-900">{fmtDate(dates.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-stone-500">Fin</span>
                        <span className="font-medium text-stone-900">{fmtDate(dates.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-stone-500">Durée</span>
                        <span className="font-medium text-stone-900">{days} jour{days > 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="font-semibold text-stone-900 text-sm mb-2">Récapitulatif</p>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-stone-600">
                            <span>Prix de base</span><span>{fmtMAD(basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>Services</span><span>+ {fmtMAD(servicesTotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700 pt-1.5 border-t border-emerald-100">
                            <span>Total</span><span>{fmtMAD(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prix / services */}
            <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-2">Prix / jour (MAD)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerDay}
                    onChange={e => setPricePerDay(e.target.value)}
                    className={inputCls}
                />

                <p className="text-sm font-medium text-stone-700 mt-6 mb-3">Services additionnels</p>
                {services.length === 0 ? (
                    <p className="text-sm text-stone-400">Aucun service disponible.</p>
                ) : (
                    <div className="space-y-2">
                        {services.map(s => {
                            const checked = s.id in selectedServices;
                            const isPerKm = s.priceType === 'per_km';
                            return (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition"
                                >
                                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleService(s.id)}
                                            className="w-4 h-4 accent-emerald-600 rounded-sm flex-shrink-0"
                                        />
                                        <span className="text-sm text-stone-800 truncate">{s.serviceName}</span>
                                    </label>
                                    {checked && isPerKm && (
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Km"
                                            value={serviceKm[s.id] ?? ''}
                                            onChange={e => setServiceKm(s.id, e.target.value)}
                                            className="w-20 flex-shrink-0 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-2 py-1.5 rounded-lg text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                                        />
                                    )}
                                    <span className="text-sm text-stone-500 flex-shrink-0">{fmtMAD(s.price)}{isPerKm && '/km'}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
