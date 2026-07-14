export const fmtMAD  = p => (p || p === 0) ? parseFloat(p).toLocaleString() + ' MAD' : '—';
export const fmtDate = d => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const FUEL_BADGE = {
    petrol:   { label: 'Essence',    cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    gasoline: { label: 'Essence',    cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    essence:  { label: 'Essence',    cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' },
    diesel:   { label: 'Diesel',     cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
    electric: { label: 'Électrique', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
    hybrid:   { label: 'Hybride',    cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100' },
};

export const STEPS = [
    { label: 'Dates & véhicule' },
    { label: 'Détails de la location' },
    { label: 'Client' },
    { label: 'Paiement' },
];
