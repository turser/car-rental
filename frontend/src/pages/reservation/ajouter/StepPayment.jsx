import { fmtMAD } from './constants';

const METHODS = [
    { value: 'cash',     label: 'Espèces',   icon: 'ti-cash' },
    { value: 'card',     label: 'Carte',     icon: 'ti-credit-card' },
    { value: 'transfer', label: 'Virement',  icon: 'ti-transfer-in' },
];

export default function StepPayment({ totalPrice, paymentMethod, setPaymentMethod, paidAmount, setPaidAmount }) {
    const paid = Number(paidAmount) || 0;
    const remaining = Math.max(totalPrice - paid, 0);
    const pct = totalPrice > 0 ? Math.min(100, Math.round((paid / totalPrice) * 100)) : 0;

    return (
        <div className="max-w-lg mx-auto">
            <div className="text-center">
                <p className="text-sm text-stone-500">Montant total à payer</p>
                <p className="mt-1">
                    <span className="text-4xl font-extrabold text-stone-900">{totalPrice.toLocaleString()}</span>
                    <span className="text-lg text-stone-400 font-medium ml-1.5">MAD</span>
                </p>
            </div>

            <div className="mt-8">
                <label className="block text-sm font-medium text-stone-700 mb-2">Moyen de paiement</label>
                <div className="grid grid-cols-3 gap-2 bg-stone-100 rounded-xl p-1">
                    {METHODS.map(m => (
                        <button
                            key={m.value}
                            type="button"
                            onClick={() => setPaymentMethod(m.value)}
                            className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                                paymentMethod === m.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            <i className={`ti ${m.icon} text-[15px]`} /> {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Montant payé maintenant (MAD)</label>
                <input
                    type="number"
                    min="0"
                    max={totalPrice}
                    step="0.01"
                    placeholder="0"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
            </div>

            <div className="mt-6 bg-stone-100 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Payé</span>
                    <span className="text-stone-500">Reste à payer</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-emerald-600">{fmtMAD(paid)}</span>
                    <span className="font-bold text-stone-900">{fmtMAD(remaining)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                    <span>{pct}% réglé</span>
                    <span>Total : {fmtMAD(totalPrice)}</span>
                </div>
            </div>
        </div>
    );
}
