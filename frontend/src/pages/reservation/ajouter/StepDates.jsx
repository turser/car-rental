import { FUEL_BADGE } from './constants';

export default function StepDates({ dates, setDate, cars, loadingCars, carId, onSelectCar, imagesById }) {
    const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-10 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';
    const hasDates = dates.startDate && dates.endDate;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Date de début</label>
                    <div className="relative">
                        <i className="ti ti-calendar-event absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[16px] pointer-events-none" />
                        <input type="datetime-local" value={dates.startDate} onChange={e => setDate('startDate', e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Date de fin</label>
                    <div className="relative">
                        <i className="ti ti-calendar-event absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[16px] pointer-events-none" />
                        <input type="datetime-local" value={dates.endDate} onChange={e => setDate('endDate', e.target.value)} className={inputCls} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                {!hasDates ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                            <i className="ti ti-calendar-event text-stone-400 text-xl" />
                        </div>
                        <p className="font-semibold text-stone-900">Sélectionnez les dates</p>
                        <p className="text-sm text-stone-400 mt-1">Les véhicules disponibles apparaîtront ici.</p>
                    </div>
                ) : loadingCars ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <svg className="animate-spin h-6 w-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                        <p className="text-sm text-stone-400 mt-3">Recherche des voitures disponibles…</p>
                    </div>
                ) : cars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                            <i className="ti ti-car-off text-stone-400 text-xl" />
                        </div>
                        <p className="font-semibold text-stone-900">Aucune voiture disponible</p>
                        <p className="text-sm text-stone-400 mt-1">Essayez une autre période.</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-stone-500 mb-4">
                            Sélectionnez le véhicule pour cette réservation. La carte sélectionnée sera mise en évidence.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {cars.map(car => {
                                const selected = String(carId) === String(car.id);
                                const img = car.image ?? imagesById[car.id];
                                const fuel = FUEL_BADGE[(car.fuelType || '').toLowerCase()] ?? { label: car.fuelType, cls: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200' };
                                return (
                                    <button
                                        type="button"
                                        key={car.id}
                                        onClick={() => onSelectCar(car.id)}
                                        className={`relative text-left bg-white border rounded-2xl overflow-hidden transition shadow-sm hover:shadow-md ${
                                            selected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-emerald-200'
                                        }`}
                                    >
                                        {selected && (
                                            <span className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                                <i className="ti ti-check text-[15px]" />
                                            </span>
                                        )}
                                        <div className="h-40 bg-stone-100 flex items-center justify-center">
                                            {img ? (
                                                <img src={img} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="ti ti-car text-stone-300 text-3xl" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="font-bold text-stone-900 truncate">{car.brand} {car.model}</p>
                                            <p className="font-mono text-sm text-stone-400 mt-0.5">{car.registrationNumber}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${fuel.cls}`}>{fuel.label}</span>
                                                <span className="text-stone-900">
                                                    <span className="font-bold">{parseFloat(car.dailyPrice).toLocaleString()}</span>
                                                    <span className="font-normal text-stone-400 text-xs ml-0.5">MAD/j</span>
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
