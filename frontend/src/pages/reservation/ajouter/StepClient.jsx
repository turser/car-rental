import { useState } from 'react';
import api from '../../../api/api';
import { translateError, translateErrors } from '../../../utils/translateError';

const NEW_CLIENT_FIELDS = [
    { name: 'nomComplet',      label: 'Nom complet',        type: 'text',  required: true, full: true, placeholder: 'ex : Mohamed Alaoui' },
    { name: 'cin',             label: 'CIN',                 type: 'text',  required: true, mono: true, placeholder: 'ex : AB123456' },
    { name: 'numeroPermis',    label: 'Numéro de permis',    type: 'text',  required: true, mono: true, placeholder: 'ex : 12/345678' },
    { name: 'expirationPermis', label: 'Expiration du permis', type: 'date', required: true },
    { name: 'telephone',      label: 'Téléphone',           type: 'tel',   required: true, placeholder: 'ex : 0612345678' },
    { name: 'email',          label: 'Email',                type: 'email', required: false, placeholder: 'ex : client@email.com' },
    { name: 'adresse',        label: 'Adresse',              type: 'text',  required: false, full: true, placeholder: 'ex : 12 Rue Mohammed V, Casablanca' },
];

function NewClientModal({ onClose, onCreated }) {
    const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';
    const [form, setForm] = useState(Object.fromEntries(NEW_CLIENT_FIELDS.map(f => [f.name, ''])));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const set = (name, val) => setForm(f => ({ ...f, [name]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await api.post('/clients', form);
            const created = res.data?.data ?? res.data;
            onCreated(created);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(errors ? translateErrors(errors) : translateError(err.response?.data?.message) || "Erreur lors de l'ajout du client.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                        <i className="ti ti-user-plus text-emerald-500" /> Nouveau client
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                    >
                        <i className="ti ti-x text-[15px]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm mb-4">
                            <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {NEW_CLIENT_FIELDS.map(f => (
                            <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    {f.label}{f.required && <span className="text-emerald-500 ml-0.5">*</span>}
                                </label>
                                <input
                                    type={f.type}
                                    required={f.required}
                                    placeholder={f.placeholder}
                                    value={form[f.name]}
                                    onChange={e => set(f.name, e.target.value)}
                                    className={`${inputCls} ${f.mono ? 'font-mono' : ''}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition disabled:opacity-60"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-medium transition"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                    </svg>
                                    Enregistrement…
                                </>
                            ) : 'Créer le client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function StepClient({ clients, clientId, onSelectClient, onClientCreated }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);

    const selected = clients.find(c => String(c.id) === String(clientId));
    const filtered = clients.filter(c => {
        const q = query.toLowerCase();
        return c.full_name.toLowerCase().includes(q) || (c.cin || '').toLowerCase().includes(q);
    });

    return (
        <div>
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[16px] pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Rechercher par CIN ou nom…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 pl-10 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                    {open && query && (
                        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-lg">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-stone-400">Aucun client trouvé.</p>
                            ) : (
                                filtered.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onMouseDown={() => { onSelectClient(String(c.id)); setQuery(''); setOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50 transition"
                                    >
                                        <span className="font-medium">{c.full_name}</span>
                                        <span className="ml-2 text-xs font-mono text-stone-400">{c.cin}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setShowNewModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition flex-shrink-0"
                >
                    <i className="ti ti-plus text-[15px]" /> Nouveau client
                </button>
            </div>

            <div className="mt-10">
                {selected ? (
                    <div className="flex items-center gap-4 border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {selected.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-stone-900 truncate">{selected.full_name}</p>
                            <p className="text-sm text-stone-500">{selected.cin} · {selected.phone}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelectClient('')}
                            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition flex-shrink-0"
                        >
                            Changer
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                            <i className="ti ti-user text-stone-400 text-xl" />
                        </div>
                        <p className="font-semibold text-stone-900">Aucun client sélectionné</p>
                        <p className="text-sm text-stone-400 mt-1">Recherchez un client existant ou créez-en un nouveau.</p>
                    </div>
                )}
            </div>

            {showNewModal && (
                <NewClientModal
                    onClose={() => setShowNewModal(false)}
                    onCreated={(client) => { onClientCreated(client); setShowNewModal(false); }}
                />
            )}
        </div>
    );
}
